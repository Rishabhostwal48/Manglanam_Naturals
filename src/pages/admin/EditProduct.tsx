import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch product data using React Query
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !product) {
    toast.error("Failed to load product");
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Product</h1>
          <p className="mb-8">The product you're trying to edit could not be loaded.</p>
          <Button onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        </div>
      </div>
    );
  }
  
    return (
    <div className="container-custom py-8">
      <Helmet>
        <title>Edit Product - {product.name} | Admin Dashboard</title>
      </Helmet>

      <div className="mb-6">
        <Button 
          variant="ghost"
          onClick={() => navigate('/admin/products')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      <ProductForm 
        initialData={product}
        isEditing={true}
        productId={id}
      />
    </div>
  );
}
