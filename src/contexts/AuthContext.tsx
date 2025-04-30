
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

// Interface pour les utilisateurs
interface User {
  email: string;
  isAdmin: boolean;
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté (stocké dans localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('instastore_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('instastore_user');
      }
    }
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<boolean> => {
    // Vérification des identifiants d'administrateur (codés en dur)
    if (email === 'yassineelabd@gmail.com' && password === 'yassine123') {
      const adminUser = {
        email,
        isAdmin: true
      };
      
      // Stocker dans le localStorage
      localStorage.setItem('instastore_user', JSON.stringify(adminUser));
      setUser(adminUser);
      toast.success("Connexion réussie!");
      return true;
    } else {
      toast.error("Email ou mot de passe incorrect");
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('instastore_user');
    setUser(null);
    navigate('/');
    toast.info("Vous êtes déconnecté");
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
