
/**
 * Utilitaire pour gérer les identifiants utilisateurs uniques
 */

// Fonction pour générer un UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Clé utilisée pour stocker l'UUID dans le localStorage
const USER_ID_KEY = 'app_user_id';

/**
 * Récupère l'identifiant utilisateur existant ou en crée un nouveau
 * @returns {string} L'identifiant utilisateur unique
 */
export const getUserId = (): string => {
  // Vérifier si un userId existe déjà dans le localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  
  // Si aucun userId n'existe, en générer un nouveau et le stocker
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};
