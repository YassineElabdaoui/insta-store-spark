
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Quelques produits par défaut pour démonstration
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Drone Professionnel',
    description: 'Drone de qualité professionnelle avec caméra 4K et stabilisateur intégré. Autonomie de 30 minutes.',
    price: 799.99,
    imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ordinateur Portable Ultra-fin',
    description: 'Ordinateur portable ultra-fin avec écran 15", processeur i7 et 16GB RAM. Idéal pour les professionnels.',
    price: 1299.99,
    imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Canapé Moderne',
    description: 'Canapé design moderne 3 places, tissu premium et confort exceptionnel pour votre salon.',
    price: 899.99,
    imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Kit de Développement IoT',
    description: 'Kit complet pour démarrer vos projets IoT avec microcontrôleur, capteurs et guides détaillés.',
    price: 129.99,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Appareil Photo Mirrorless',
    description: 'Appareil photo mirrorless compact avec capteur plein format, idéal pour la photographie professionnelle.',
    price: 1899.99,
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
    createdAt: new Date().toISOString(),
  }
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupération des produits du localStorage ou utilisation des produits par défaut
    const loadProducts = () => {
      setIsLoading(true);
      try {
        const storedProducts = localStorage.getItem('instastore_products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // Utilisation des produits par défaut si aucun produit n'est stocké
          setProducts(defaultProducts);
          localStorage.setItem('instastore_products', JSON.stringify(defaultProducts));
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error("Erreur lors du chargement des produits");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Sauvegarde des produits dans le localStorage à chaque modification
  const saveProducts = (updatedProducts: Product[]) => {
    try {
      localStorage.setItem('instastore_products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error("Erreur lors de la sauvegarde des produits");
    }
  };

  // Ajout d'un nouveau produit
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(), // ID unique basé sur le timestamp
      createdAt: new Date().toISOString()
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produit ajouté avec succès");
  };

  // Mise à jour d'un produit existant
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, ...updatedFields } : product
    );
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produit mis à jour avec succès");
  };

  // Suppression d'un produit
  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    toast.success("Produit supprimé avec succès");
  };

  // Récupération d'un produit par son ID
  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    isLoading
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
