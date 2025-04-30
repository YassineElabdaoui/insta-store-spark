
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/contexts/ProductContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105" 
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-gray-600 line-clamp-2 text-sm mb-2">{product.description}</p>
        <p className="font-bold text-primary-700">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 border-t">
        <Button 
          onClick={() => navigate(`/product/${product.id}`)}
          className="w-full bg-primary hover:bg-primary-600"
        >
          Voir le produit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
