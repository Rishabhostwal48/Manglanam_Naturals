import { Helmet } from 'react-helmet-async';
import ProductForm from '@/components/admin/ProductForm';

export default function AddProduct() {
  return (
    <div className="p-6">
      <Helmet>
        <title>Add Product - Manglanam Admin</title>
      </Helmet>
      
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </header>
      
      <ProductForm />
    </div>
  );
}
