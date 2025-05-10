
import { useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingBag, ArrowLeft, Heart, Play, ChevronLeft, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { categories } from '@/data/products';

interface Product {
  _id: string | any; // Allow for MongoDB ObjectId or string
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  video?: string; // URL to product video
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  weight: string;
  origin: string;
  tags: string[];
  rating: number;
  reviewCount: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch product data from API
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        // Ensure id is a string, not an object
        // At this point, we know id is not null or undefined
        const productIdOrSlug = typeof id === 'object' ? id.toString() : id!;
        console.log('Fetching product with ID or slug:', productIdOrSlug);
        return await productService.getProductById(productIdOrSlug);
      } catch (err) {
        console.error('Error fetching product:', err);
        throw err;
      }
    },
    enabled: !!id // Only run the query if id exists
  });
  
  // Fetch related products
  const { data: relatedProductsData } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      try {
        const data = await productService.getProducts({ category: product.category });
        return data.products.filter(p => p._id !== product._id).slice(0, 4);
      } catch (err) {
        console.error('Error fetching related products:', err);
        return [];
      }
    },
    enabled: !!product?.category
  });
  
  const relatedProducts = relatedProductsData || [];
  
  if (isLoading) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Product...</h1>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild rounded="full" variant="cardamom">
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : prev));
  };
  
  const handleAddToCart = () => {
    addItem(product, quantity);
  };
  
  // Get category name for display
  const getCategoryName = (categoryId: string) => {
    switch (categoryId) {
      case 'whole-spices': return 'Whole Spices';
      case 'ground-spices': return 'Ground Spices';
      case 'blends': return 'Spice Blends';
      case 'herbs': return 'Dried Herbs';
      case 'exotic': return 'Exotic Spices';
      default: return categoryId;
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400 mt-0.5" />
            <Link to="/products" className="text-gray-500 hover:text-primary">Products</Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400 mt-0.5" />
            <Link 
              to={`/products?category=${product.category}`}
              className="text-gray-500 hover:text-primary"
            >
              {getCategoryName(product.category)}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400 mt-0.5" />
            <span className="text-gray-700">{product.name}</span>
          </nav>
        </div>
      </div>
      
      {/* Back Button - Mobile Only */}
      <div className="container-custom pt-4 md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-gray-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      
      {/* Product Details */}
      <div className="container-custom py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="rounded-lg overflow-hidden border bg-white p-4 relative">
              {/* Display selected image from gallery or main image */}
              <img
                src={product.images && product.images.length > 0 
                  ? product.images[selectedImage] 
                  : product.image}
                alt={product.name}
                className="w-full h-auto object-contain aspect-square"
              />
              
              {/* Video Play Button (if video exists) */}
              {product.video && (
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition-colors"
                  aria-label="Play product video"
                >
                  <Play className="h-6 w-6" />
                </button>
              )}
            </div>
            
            {/* Thumbnails Gallery */}
            {(product.images && product.images.length > 0) && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Main product image as first thumbnail */}
                <button
                  onClick={() => setSelectedImage(0)}
                  className={`flex-shrink-0 border-2 rounded overflow-hidden ${
                    selectedImage === 0 ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={product.images[0]} 
                    alt={`${product.name} - thumbnail 1`}
                    className="w-16 h-16 object-cover"
                  />
                </button>
                
                {/* Additional images */}
                {product.images.slice(1).map((image, index) => (
                  <button
                    key={`thumb-${index + 1}`}
                    onClick={() => setSelectedImage(index + 1)}
                    className={`flex-shrink-0 border-2 rounded overflow-hidden ${
                      selectedImage === index + 1 ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - thumbnail ${index + 2}`}
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                ))}
                
                {/* Video thumbnail (if video exists) */}
                {product.video && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="flex-shrink-0 border-2 border-transparent rounded overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <img 
                      src={product.image} // Use main image as video thumbnail
                      alt={`${product.name} - video`}
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Link 
                to={`/products?category=${product.category}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {getCategoryName(product.category)}
              </Link>
              <h1 className="text-3xl font-playfair font-bold mt-1">{product.name}</h1>
              
              <div className="mt-4 flex items-center">
                {product.salePrice ? (
                  <div className="flex items-center">
                    <span className="text-2xl font-semibold text-destructive">{formatCurrency(product.salePrice)}</span>
                    <span className="ml-2 text-lg text-gray-500 line-through">{formatCurrency(product.price)}</span>
                    <span className="ml-2 bg-destructive/10 text-destructive px-2 py-0.5 rounded text-sm">
                      Save {Math.round((1 - product.salePrice / product.price) * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
                )}
                <span className="ml-2 text-sm text-gray-500">/ {product.weight}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Origin</h3>
                  <p>{product.origin}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                  <p>{product.weight}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border rounded-full overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-none"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-none"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Add to Cart Button */}
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <Button 
                    className="col-span-4" 
                    size="lg"
                    variant="cardamom"
                    rounded="full"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    rounded="full"
                    className="h-11 w-11"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Free shipping for orders over $50
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container-custom">
            <h2 className="text-2xl font-playfair font-bold mb-8">You May Also Like</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard 
                  key={relatedProduct._id ? relatedProduct._id : `related-product-${index}`} 
                  product={relatedProduct} 
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Video Modal */}
      {showVideoModal && product.video && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-4xl">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-semibold">{product.name} - Video</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowVideoModal(false);
                  if (videoRef.current) {
                    videoRef.current.pause();
                  }
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <video 
                ref={videoRef}
                src={product.video} 
                controls 
                className="w-full h-auto"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
