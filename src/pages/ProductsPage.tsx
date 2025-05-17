import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProductSize {
  size: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
}

interface Product {
  _id: string | any; // Allow for MongoDB ObjectId or string
  name: string;
  slug: string;
  category: string;
  price: number; // Default price (for backward compatibility)
  salePrice?: number; // Default sale price (for backward compatibility)
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  video?: string; // URL to product video
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  weight: string; // Default weight (for backward compatibility)
  origin: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  sizes?: ProductSize[]; // Array of available sizes with their respective prices
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({}); // Track selected size for each product

  // Fetch products with React Query
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('keyword', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      
      try {
        console.log(`Fetching products with params: ${params.toString()}`);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products?${params.toString()}`);
        console.log('Products API response:', response.data);
        
        // Add mock size data for testing if not provided by API
        // This can be removed once the backend is updated
        if (response.data && response.data.products) {
          response.data.products = response.data.products.map((product: Product) => {
            if (!product.sizes || product.sizes.length === 0) {
              // Create mock sizes based on the product's weight
              const defaultWeight = product.weight || '250g';
              
              // Mock data for testing - this should come from the backend in production
              product.sizes = [
                {
                  size: '250g',
                  price: product.price,
                  salePrice: product.salePrice,
                  inStock: product.inStock
                },
                {
                  size: '500g',
                  price: Math.round(product.price * 1.8), // 80% more for 500g
                  salePrice: product.salePrice ? Math.round(product.salePrice * 1.8) : undefined,
                  inStock: product.inStock
                },
                {
                  size: '1kg',
                  price: Math.round(product.price * 3.5), // 3.5x for 1kg
                  salePrice: product.salePrice ? Math.round(product.salePrice * 3.5) : undefined,
                  inStock: product.inStock
                }
              ];
            }
            return product;
          });
        }
        
        return response.data;
      } catch (err) {
        console.error('Error fetching products:', err);
        throw err;
      }
    }
  });

  // Get product ID as string
  const getProductId = (product: Product): string => {
    return product._id ? 
      (typeof product._id === 'object' ? product._id.toString() : product._id.toString()) : '';
  };

  // Initialize selected sizes when products load
  useEffect(() => {
    if (productsData?.products && productsData.products.length > 0) {
      const initialSizes: Record<string, string> = {};
      
      productsData.products.forEach((product: Product) => {
        const productId = getProductId(product);
        if (product.sizes && product.sizes.length > 0) {
          // Default to first size option
          initialSizes[productId] = product.sizes[0].size;
        }
      });
      
      setSelectedSizes(initialSizes);
    }
  }, [productsData]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    // Use slug if available, otherwise use ID (ensuring it's a string)
    const productIdentifier = product.slug || 
      (product._id ? (typeof product._id === 'object' ? product._id.toString() : product._id) : '');
    console.log('Navigating to product with identifier:', productIdentifier);
    navigate(`/product/${productIdentifier}`);
  };
  
  // Handle size selection
  const handleSizeSelect = (e: React.MouseEvent, productId: string, size: string) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };
  
  // Get current price based on selected size
  const getCurrentPrice = (product: Product): { price: number, salePrice?: number } => {
    if (!product.sizes || product.sizes.length === 0) {
      return { price: product.price, salePrice: product.salePrice };
    }
    
    const productId = getProductId(product);
    const selectedSize = selectedSizes[productId];
    
    // If no size is selected, use the first size or default
    if (!selectedSize) {
      return { 
        price: product.sizes[0]?.price || product.price,
        salePrice: product.sizes[0]?.salePrice
      };
    }
    
    // Find the selected size
    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (sizeInfo) {
      return { price: sizeInfo.price, salePrice: sizeInfo.salePrice };
    }
    
    // Fallback to default
    return { price: product.price, salePrice: product.salePrice };
  };

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  if (error) {
    toast.error('Failed to load products');
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Products</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ground-spices">Ground Spices</SelectItem>
              <SelectItem value="whole-spices">Whole Spices</SelectItem>
              <SelectItem value="blends">Spice Blends</SelectItem>
              <SelectItem value="herbs">Dried Herbs</SelectItem>
              <SelectItem value="exotic">Exotic Spices</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : productsData?.products && productsData.products.length > 0 ? (
          // Actual products
          productsData.products.map((product: Product, index: number) => (
            <Card 
              key={product._id ? (typeof product._id === 'object' ? product._id.toString() : product._id) : `product-${index}`} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              <CardHeader className="p-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-15 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.shortDescription}</p>
                
                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium mb-1">Size:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sizeOption) => {
                        const productId = getProductId(product);
                        const isSelected = selectedSizes[productId] === sizeOption.size || 
                          (!selectedSizes[productId] && sizeOption.size === product.sizes![0].size);
                        
                        return (
                          <button
                            key={sizeOption.size}
                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                              isSelected 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                            } ${!sizeOption.inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={!sizeOption.inStock}
                            onClick={(e) => handleSizeSelect(e, productId, sizeOption.size)}
                          >
                            {sizeOption.size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                
                {/* Price Display */}
                <div className="flex items-center justify-between">
                  <div>
                    {(() => {
                      const { price, salePrice } = getCurrentPrice(product);
                      return salePrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            ₹{salePrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          ₹{price}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* Display weight if no sizes or for backward compatibility */}
                  {(!product.sizes || product.sizes.length === 0) && (
                    <span className="text-sm text-gray-500">{product.weight}</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart logic here with selected size
                    const productId = getProductId(product);
                    const selectedSize = selectedSizes[productId] || 
                      (product.sizes && product.sizes.length > 0 ? product.sizes[0].size : product.weight);
                    console.log(`Adding to cart: ${product.name}, Size: ${selectedSize}`);
                  }}
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          // No products found
          <div className="col-span-full text-center py-8">
            <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 