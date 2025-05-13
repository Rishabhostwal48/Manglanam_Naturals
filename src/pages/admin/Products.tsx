import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { categories } from '@/data/products';
import { productService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Loader2 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  description: string;
  featured: boolean;
  bestSeller: boolean;
  origin: string;
  weight: string;
  inStock: boolean;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products for admin panel...');
        const data = await productService.getProducts();
        console.log('Admin products data:', data);
        
        // Check if data has the expected structure
        if (data && data.products) {
          setProducts(data.products);
        } else {
          console.error('Unexpected data structure:', data);
          setProducts(data || []);
        }
      } catch (err) {
        let errorMessage = "Failed to fetch products";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        console.error('Error fetching products:', err);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);
  
  // Filter products based on search query and active tab
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = 
      (product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product?.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'featured') return matchesSearch && product?.featured;
    if (activeTab === 'best-sellers') return matchesSearch && product?.bestSeller;
    if (activeTab === 'out-of-stock') return matchesSearch && !product?.inStock;
    return matchesSearch && product?.category === activeTab;
  }) : [];

  // Handle edit product
  const handleEditProduct = (id: string) => {
    navigate(`/admin/products/edit/${id}`);
  };

  // Handle delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(product => product._id !== id));
        toast({
          title: "Success",
          description: `Product "${name}" deleted successfully`,
        });
      } catch (error) {
        let errorMessage = "Failed to delete product";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // Handle view product on storefront
  const handleViewProduct = (id: string) => {
    window.open(`/product/${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500">Error</h1>
          <p className="mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4" 
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Helmet>
        <title>Products - Manglanam Admin</title>
      </Helmet>
      
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
           <Button 
          onClick={() => navigate("/admin")} 
          variant="ghost" 
          size="sm" 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
          <h1 className="text-xl md:text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button 
          variant="cinnamon"
          onClick={() => navigate('/admin/products/add')}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-4 flex w-auto min-w-max">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="best-sellers">Best Sellers</TabsTrigger>
            <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b">
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-muted-foreground">No products found</p>
                          <Button 
                            variant="link" 
                            onClick={() => navigate('/admin/products/add')}
                            className="mt-2"
                          >
                            Add your first product
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {/* Mobile View: Card Layout */}
                        <tr className="md:hidden">
                          <td colSpan={5} className="p-0">
                            <div className="grid grid-cols-1 gap-4 p-4">
                              {filteredProducts.map((product, index) => (
                                <div key={`product-mobile-${index}`} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex items-start space-x-3">
                                    <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100 flex-shrink-0">
                                      {typeof product.image === 'string' ? (
                                        <img 
                                          src={product.image} 
                                          alt={product.name} 
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                          <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium truncate">{product.name || 'Unnamed Product'}</h3>
                                      <p className="text-xs text-muted-foreground">ID: {product._id || 'No ID'}</p>
                                      <div className="mt-1">
                                        <Badge variant="outline">
                                          {categories.find(c => c.id === product.category)?.name || product.category || 'Uncategorized'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <div>
                                      {product.salePrice ? (
                                        <div>
                                          <span className="font-medium">{formatCurrency(product.salePrice)}</span>
                                          <span className="text-sm text-muted-foreground line-through ml-2">
                                            {formatCurrency(product.price)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="font-medium">{formatCurrency(product.price || 0)}</span>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 justify-end">
                                      {!product.inStock && (
                                        <Badge variant="destructive">Out of Stock</Badge>
                                      )}
                                      {product.featured && (
                                        <Badge variant="outline" className="bg-cardamom/10 text-cardamom-foreground border-cardamom/20">
                                          Featured
                                        </Badge>
                                      )}
                                      {product.bestSeller && (
                                        <Badge variant="outline" className="bg-turmeric/10 text-turmeric-foreground border-turmeric/20">
                                          Best Seller
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="pt-2 flex justify-end gap-2 border-t">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleViewProduct(product._id)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditProduct(product._id)}
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product._id, product.name)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Desktop View: Table Layout */}
                        {filteredProducts.map((product, index) => (
                          <tr key={`product-desktop-${index}`} className="border-b hover:bg-muted/30 hidden md:table-row">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                                  {typeof product.image === 'string' ? (
                                    <img 
                                      src={product.image} 
                                      alt={product.name} 
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{product.name || 'Unnamed Product'}</h3>
                                  <p className="text-xs text-muted-foreground">ID: {product._id || 'No ID'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {categories.find(c => c.id === product.category)?.name || product.category || 'Uncategorized'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {product.salePrice ? (
                                <div>
                                  <span className="font-medium">{formatCurrency(product.salePrice)}</span>
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    {formatCurrency(product.price || 0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-medium">{formatCurrency(product.price || 0)}</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1.5">
                                {!product.inStock && (
                                  <Badge variant="destructive">Out of Stock</Badge>
                                )}
                                {product.featured && (
                                  <Badge variant="outline" className="bg-cardamom/10 text-cardamom-foreground border-cardamom/20">
                                    Featured
                                  </Badge>
                                )}
                                {product.bestSeller && (
                                  <Badge variant="outline" className="bg-turmeric/10 text-turmeric-foreground border-turmeric/20">
                                    Best Seller
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewProduct(product._id)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditProduct(product._id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product._id, product.name)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}