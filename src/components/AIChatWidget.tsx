
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/contexts/ProductContext";
import { toast } from "sonner";

interface AIChatWidgetProps {
  product: Product;
  onClose: () => void;
}

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

const INITIAL_QUESTIONS = [
  "Bonjour ! Je suis ravi de votre intérêt pour ce produit. Pourriez-vous me dire votre nom ?",
  "Merci ! Où êtes-vous situé(e) ?",
  "Parfait. Avez-vous des questions spécifiques concernant ce produit ?",
  "Nous avons bien noté votre question. Y a-t-il autre chose que vous aimeriez savoir ?"
];

const WEBHOOK_URL = 'https://3cb3-196-64-218-121.ngrok-free.app/webhook/bdb34e5d-3bdd-4328-aeb2-96821aa62891';

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ product, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: INITIAL_QUESTIONS[0] }
  ]);
  const [userInput, setUserInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    location: '',
    question: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);

  const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const sendMessageToWebhook = async (userMessage: string, step: number) => {
    setIsWaitingForWebhook(true);
    
    try {
      const payload = {
        message: userMessage,
        productId: product.id,
        userId: 'anonymous', // Comme les acheteurs n'ont pas de compte
        step: step,
        customerInfo: {
          ...customerInfo,
          [step === 0 ? 'name' : step === 1 ? 'location' : 'question']: userMessage
        }
      };

      console.log("Sending to webhook:", payload);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Webhook response:", data);

      // Accepter tous les types de réponses du webhook n8n
      if (Array.isArray(data) && data.length > 0) {
        // Si c'est un tableau, utilisez le premier élément
        return data[0];
      } else if (data?.response) {
        // Si c'est un objet avec une propriété 'response'
        return data.response;
      } else {
        // Sinon, utilisez la réponse complète ou la question suivante
        return data || (step + 1 < INITIAL_QUESTIONS.length ? INITIAL_QUESTIONS[step + 1] : INITIAL_QUESTIONS[3]);
      }
    } catch (error) {
      console.error("Error calling webhook:", error);
      toast.error("Problème de communication avec le service. Utilisation du mode standard.");
      return step + 1 < INITIAL_QUESTIONS.length ? INITIAL_QUESTIONS[step + 1] : INITIAL_QUESTIONS[3];
    } finally {
      setIsWaitingForWebhook(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isSubmitting || isWaitingForWebhook) return;

    setIsSubmitting(true);

    // Ajouter la réponse de l'utilisateur
    const updatedMessages = [
      ...messages,
      { role: 'user' as const, content: userInput }
    ];

    setMessages(updatedMessages);

    // Mettre à jour les informations client en fonction de l'étape
    const newCustomerInfo = { ...customerInfo };
    switch (currentStep) {
      case 0:
        newCustomerInfo.name = userInput;
        break;
      case 1:
        newCustomerInfo.location = userInput;
        break;
      case 2:
      default:
        // Pour toutes les étapes après les 2 premières, considérer comme une question
        if (currentStep === 2) {
          newCustomerInfo.question = userInput;
        }
        break;
    }

    setCustomerInfo(newCustomerInfo);
    setUserInput('');

    // Envoyer au webhook et attendre la réponse
    const webhookResponse = await sendMessageToWebhook(userInput, currentStep);

    if (webhookResponse) {
      // Ajouter la réponse du webhook à la conversation
      setMessages(prev => [
        ...prev,
        { role: 'system' as const, content: webhookResponse }
      ]);

      // Avancer à l'étape suivante, mais jamais au-delà de la question finale (qui se répètera)
      const nextStep = currentStep < 3 ? currentStep + 1 : 3;
      setCurrentStep(nextStep);
      
      // La conversation ne se termine jamais automatiquement
      setIsComplete(false);
    } else {
      // Si pas de réponse du webhook, utiliser la question standard suivante
      setMessages(prev => [
        ...prev,
        { role: 'system' as const, content: INITIAL_QUESTIONS[3] }
      ]);
      setCurrentStep(3);
      setIsComplete(false);
    }
    
    setIsSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-primary p-4 text-white flex justify-between items-center">
          <h3 className="font-semibold">Discussion à propos de: {product.name}</h3>
          <Button variant="ghost" size="sm" className="text-white hover:bg-primary-600" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 max-h-[400px] space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`${
                message.role === 'system' 
                  ? 'bg-gray-100 rounded-lg p-3 max-w-[80%]' 
                  : 'bg-primary-100 rounded-lg p-3 max-w-[80%] ml-auto'
              }`}
            >
              {message.content}
            </div>
          ))}
          
          {isWaitingForWebhook && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex flex-col space-y-2">
            <Textarea
              value={userInput}
              onChange={handleUserInput}
              onKeyDown={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="resize-none"
              rows={2}
              disabled={isSubmitting || isWaitingForWebhook}
            />
            <Button 
              onClick={sendMessage} 
              className="ml-auto"
              disabled={isSubmitting || isWaitingForWebhook || !userInput.trim()}
            >
              {isSubmitting || isWaitingForWebhook ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
