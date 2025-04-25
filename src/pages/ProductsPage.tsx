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

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  weight: string;
  origin: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch products with React Query
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('keyword', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data;
    }
  });

  // Handle product click
  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.slug}`);
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
          productsData.products.map((product: Product) => (
            <Card 
              key={product._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleProductClick(product)}
            >
              <CardHeader className="p-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.shortDescription}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          ₹{product.salePrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{product.weight}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart logic here
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