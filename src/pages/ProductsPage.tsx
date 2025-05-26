import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

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
  hasMultipleSizes: boolean;
  basePrice?: number;
  baseSalePrice?: number;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Fetch products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, sortBy, searchTerm],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Fetch products using api instance
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60, // Keep data fresh for 1 minute
    refetchOnWindowFocus: false
  });

  // Prefetch individual product data when hovering
  const prefetchProduct = async (product: Product) => {
    // Skip if we already have this product in cache
    if (queryClient.getQueryData(['product', product._id])) return;

    // Prefetch and store in cache
    await queryClient.prefetchQuery({
      queryKey: ['product', product._id],
      queryFn: () => Promise.resolve(product),
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  };

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
    const productIdentifier = product.slug || getProductId(product);
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
    // If no sizes available, use default price
    if (!product.hasMultipleSizes || !product.sizes || !Array.isArray(product.sizes) || product.sizes.length === 0) {
      return { 
        price: product.basePrice || product.price || 0,
        salePrice: product.baseSalePrice || product.salePrice
      };
    }

    const productId = getProductId(product);
    const selectedSize = selectedSizes[productId];

    // If no size is selected, use the first size or default
    if (!selectedSize) {
      return {
        price: product.sizes[0]?.price || product.basePrice || product.price || 0,
        salePrice: product.sizes[0]?.salePrice || product.baseSalePrice || product.salePrice
      };
    }

    // Find the selected size
    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (sizeInfo) {
      return { 
        price: sizeInfo.price,
        salePrice: sizeInfo.salePrice
      };
    }

    // Fallback to default
    return { 
      price: product.basePrice || product.price || 0,
      salePrice: product.baseSalePrice || product.salePrice
    };
  };

  // Loading skeleton component
  const ProductSkeleton = () => (
    <Card className="w-full h-[450px]">
      <CardHeader className="p-0">
        <Skeleton className="h-64 w-full rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

    const productId = getProductId(product);
    const selectedSize = selectedSizes[productId] ||
      (product.sizes && product.sizes.length > 0 ? product.sizes[0].size : product.weight || '');

    // Add to cart with selected size
    addItem(product, selectedSize, 1);
  };

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
          // Loading skeletons with message
          <>
            <div className="col-span-full text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-600">Loading Products</h3>
              <p className="text-gray-500">Please hang tight while we fetch the products...</p>
            </div>
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        ) : productsData?.products && productsData.products.length > 0 ? (
          // Actual products
          productsData.products.map((product: Product, index: number) => (
            <Card
              key={product._id ? (typeof product._id === 'object' ? product._id.toString() : product._id) : `product-${index}`}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
              onMouseEnter={() => prefetchProduct(product)}
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
                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${isSelected
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

                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => handleAddToCart(e, product)}
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