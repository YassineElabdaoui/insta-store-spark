import React, { useState } from 'react';
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
  "Merci pour votre intérêt ! Un conseiller vous contactera bientôt avec plus d'informations."
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
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);
  const [isFreeChat, setIsFreeChat] = useState(false);

  const handleUserInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const sendMessageToWebhook = async (userMessage: string, step: number) => {
    setIsWaitingForWebhook(true);

    try {
      const payload = {
        message: userMessage,
        productId: product.id,
        userId: 'anonymous',
        step: step,
        customerInfo: {
          ...customerInfo,
          [step === 0 ? 'name' : step === 1 ? 'location' : 'question']: userMessage
        }
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data?.response || (step + 1 < INITIAL_QUESTIONS.length ? INITIAL_QUESTIONS[step + 1] : null);

    } catch (error) {
      console.error("Error calling webhook:", error);
      toast.error("Problème de communication avec le service. Utilisation du mode standard.");
      return step + 1 < INITIAL_QUESTIONS.length ? INITIAL_QUESTIONS[step + 1] : null;
    } finally {
      setIsWaitingForWebhook(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isSubmitting || isWaitingForWebhook) return;

    setIsSubmitting(true);

    const updatedMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(updatedMessages);

    if (!isFreeChat) {
      const newCustomerInfo = { ...customerInfo };
      if (currentStep === 0) newCustomerInfo.name = userInput;
      if (currentStep === 1) newCustomerInfo.location = userInput;
      if (currentStep === 2) newCustomerInfo.question = userInput;
      setCustomerInfo(newCustomerInfo);

      const webhookResponse = await sendMessageToWebhook(userInput, currentStep);

      const nextStep = currentStep + 1;
      if (webhookResponse) {
        setMessages(prev => [...prev, { role: 'system' as const, content: webhookResponse }]);
        setCurrentStep(nextStep);

        if (nextStep >= INITIAL_QUESTIONS.length) {
          setIsFreeChat(true);
        }
      } else {
        setIsFreeChat(true); // Even on error, allow continued chat
      }

    } else {
      // Mode libre : envoyer au webhook sans changer d'étape
      await sendMessageToWebhook(userInput, currentStep);
    }

    setUserInput('');
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
