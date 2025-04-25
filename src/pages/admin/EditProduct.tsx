import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { getProductById, Product } from '@/data/products';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call
      const foundProduct = getProductById(id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        toast.error("Product not found");
        navigate('/admin/products');
      }
    }
    
    setLoading(false);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/4 bg-gray-200 rounded mb-8"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="p-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Helmet>
        <title>Edit Product - Manglanam Admin</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Editing "{product.name}"</p>
      </header>
      
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
