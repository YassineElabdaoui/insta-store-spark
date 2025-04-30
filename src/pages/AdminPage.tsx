
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, Product } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  imageFile: File | null;
  imageUrl: string;
}

const emptyProductForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  imageFile: null,
  imageUrl: "",
};

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormData>(emptyProductForm);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Redirection si non admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  // Fonction pour ouvrir la boîte de dialogue d'ajout
  const openAddDialog = () => {
    setProductForm(emptyProductForm);
    setImagePreview(null);
    setShowAddDialog(true);
  };

  // Fonction pour ouvrir la boîte de dialogue d'édition
  const openEditDialog = (product: Product) => {
    setCurrentProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageFile: null,
      imageUrl: product.imageUrl,
    });
    setImagePreview(product.imageUrl);
    setShowEditDialog(true);
  };

  // Fonction pour ouvrir la boîte de dialogue de suppression
  const openDeleteDialog = (productId: string) => {
    setCurrentProductId(productId);
    setShowDeleteDialog(true);
  };

  // Gestion du changement des champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de la sélection de fichier image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setProductForm((prev) => ({ ...prev, imageFile: file }));
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Fonction pour ajouter ou mettre à jour un produit
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation simple
      if (!productForm.name || !productForm.description || !productForm.price) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
      
      // Validation du prix
      const price = parseFloat(productForm.price);
      if (isNaN(price) || price <= 0) {
        toast.error("Le prix doit être un nombre positif");
        return;
      }
      
      // Gestion de l'image
      let imageUrl = productForm.imageUrl;
      
      if (productForm.imageFile) {
        // Dans un cas réel, on téléchargerait l'image vers un service de stockage
        // Pour la démo, on convertit en base64
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(productForm.imageFile as File);
        });
      }
      
      // Si aucune image n'est fournie, utiliser une image par défaut
      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7";
      }
      
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price,
        imageUrl,
      };
      
      if (showAddDialog) {
        addProduct(productData);
        setShowAddDialog(false);
      } else if (showEditDialog && currentProductId) {
        updateProduct(currentProductId, productData);
        setShowEditDialog(false);
      }
      
      // Réinitialiser le formulaire
      setProductForm(emptyProductForm);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification du produit:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour supprimer un produit
  const handleDeleteProduct = () => {
    if (currentProductId) {
      deleteProduct(currentProductId);
      setShowDeleteDialog(false);
    }
  };

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!isAdmin) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Administration des produits</h1>
        <Button onClick={openAddDialog}>Ajouter un produit</Button>
      </div>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">Aucun produit disponible</h2>
          <p className="text-gray-500 mt-2">Ajoutez votre premier produit avec le bouton ci-dessus.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-48">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-auto">
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <p className="text-primary-600 font-bold">{formatPrice(product.price)}</p>
                      <p className="text-gray-700 text-sm mt-2 line-clamp-3">{product.description}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(product.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogue d'ajout de produit */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau produit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du produit*</Label>
                <Input
                  id="name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prix (€)*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-h-32 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ajout en cours..." : "Ajouter le produit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition de produit */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du produit*</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Prix (€)*</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description*</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-h-32 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Modification en cours..." : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
