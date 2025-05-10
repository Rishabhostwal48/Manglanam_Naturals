import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Product } from '@/data/products';
import { productService } from '@/services/api';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditProduct() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        console.log('Fetching product with ID:', productId);
        const data = await productService.getProductById(productId);
        console.log('Product data received:', data);
        
        if (data && data.product) {
          setProduct(data.product);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        let errorMessage = "Failed to fetch product";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error("Product not found");
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
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
          <h2 className="text-2xl font-bold text-destructive">Error Loading Product</h2>
          <p className="text-muted-foreground mt-2">
            {error}
          </p>
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
