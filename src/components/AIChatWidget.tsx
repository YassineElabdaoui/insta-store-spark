
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  "Merci pour votre intérêt ! Un conseiller vous contactera bientôt avec plus d'informations."
];

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

  const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Ajouter la réponse de l'utilisateur
    const updatedMessages = [
      ...messages,
      { role: 'user', content: userInput }
    ];
    
    setMessages(updatedMessages);
    
    // Mettre à jour les informations client en fonction de l'étape
    switch (currentStep) {
      case 0:
        setCustomerInfo(prev => ({ ...prev, name: userInput }));
        break;
      case 1:
        setCustomerInfo(prev => ({ ...prev, location: userInput }));
        break;
      case 2:
        setCustomerInfo(prev => ({ ...prev, question: userInput }));
        break;
    }
    
    setUserInput('');
    
    // Passer à la question suivante s'il en reste
    const nextStep = currentStep + 1;
    
    if (nextStep < INITIAL_QUESTIONS.length) {
      // Simuler un délai pour rendre la conversation plus naturelle
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'system', content: INITIAL_QUESTIONS[nextStep] }
        ]);
        setCurrentStep(nextStep);
        setIsSubmitting(false);
      }, 1000);
    } else {
      // Conversation terminée
      setIsComplete(true);
      
      // Simuler l'envoi des données vers un webhook
      try {
        console.log("Données client à envoyer au webhook:", {
          product: {
            id: product.id,
            name: product.name,
            price: product.price
          },
          customer: customerInfo,
          timestamp: new Date().toISOString()
        });
        
        // Simuler un appel webhook réussi
        setTimeout(() => {
          toast.success("Vos informations ont été enregistrées");
          setIsSubmitting(false);
        }, 1500);
      } catch (error) {
        console.error("Erreur lors de l'envoi des données:", error);
        toast.error("Une erreur est survenue");
        setIsSubmitting(false);
      }
    }
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
        </div>
        
        <div className="border-t p-4">
          {!isComplete ? (
            <div className="flex flex-col space-y-2">
              <Textarea
                value={userInput}
                onChange={handleUserInput}
                onKeyDown={handleKeyPress}
                placeholder="Écrivez votre message..."
                className="resize-none"
                rows={2}
                disabled={isSubmitting}
              />
              <Button 
                onClick={sendMessage} 
                className="ml-auto"
                disabled={isSubmitting || !userInput.trim()}
              >
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full">
              Fermer la discussion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
