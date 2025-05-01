
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts, Product } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AIChatWidget from "@/components/AIChatWidget";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, isLoading } = useProducts();
  const [showChat, setShowChat] = useState(false);
  
  // Obtenir le produit par ID
  const product = id ? getProduct(id) : undefined;
  
  // Rediriger vers la page 404 si le produit n'existe pas après le chargement
  if (!isLoading && !product) {
    navigate('/not-found');
    return null;
  }
  
  if (isLoading || !product) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image du produit */}
        <div className="rounded-lg overflow-hidden shadow-md">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-[400px] object-cover"
          />
        </div>
        
        {/* Détails du produit */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary-700">{formatPrice(product.price)}</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-lg mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <Button 
            onClick={() => setShowChat(true)}
            className="w-full bg-primary hover:bg-primary-600 py-6 text-lg"
          >
            Discuter avec un conseiller IA
          </Button>
        </div>
      </div>
      
      {/* Chat widget with key prop to ensure proper re-mounting */}
      {showChat && (
        <AIChatWidget 
          key={`chat-${product.id}`}
          product={product} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
};

export default ProductPage;
