
import React from 'react';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingProductCard = () => (
  <div className="flex flex-col">
    <Skeleton className="h-60 w-full rounded-md" />
    <Skeleton className="h-6 w-3/4 mt-4" />
    <Skeleton className="h-4 w-full mt-2" />
    <Skeleton className="h-4 w-1/2 mt-2" />
  </div>
);

const HomePage = () => {
  const { products, isLoading } = useProducts();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary-700">Bienvenue sur InstaStore</h1>
      <p className="text-lg text-gray-600 mb-8">Découvrez notre sélection de produits premium</p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <LoadingProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">Aucun produit disponible</h2>
          <p className="text-gray-500 mt-2">Veuillez revenir plus tard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
