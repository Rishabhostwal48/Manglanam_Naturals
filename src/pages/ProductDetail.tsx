import { useState, useRef,useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingBag, ArrowLeft, Heart, Play, ChevronLeft, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/utils';
import { categories } from '@/data/products';
import ProductMediaCarousel from '@/components/ProductMediaCarousel';
import { toast } from 'react-hot-toast';


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
  hasMultipleSizes: boolean;
  basePrice: number;
  baseSalePrice?: number;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  video?: string; // URL to product video
  featured: boolean;
  bestSeller: boolean;
  inStock: boolean;
  origin: string;
  tags: string[];
  rating: number;
  sizes?: ProductSize[]; // Array of available sizes with their respective prices
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
const [selectedSize, setSelectedSize] = useState<string>('');

  // Get the query client
  const queryClient = useQueryClient();

  // Fetch product data from API or cache
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        // First check if we have the product in the products cache
        const cachedProducts = queryClient.getQueryData(['products']);
        if (cachedProducts?.products) {
          const cachedProduct = cachedProducts.products.find(
            (p: Product) => p._id.toString() === id || p.slug === id
          );
          if (cachedProduct) {
            console.log('Using cached product data');
            return cachedProduct;
          }
        }

        // If not in cache, fetch from API
        console.log('Fetching product from API');
        // Determine if the ID is a slug or ObjectId
        const isSlug = id.includes('-') || !id.match(/^[0-9a-fA-F]{24}$/);
        return await productService.getProductById(id, isSlug ? 'slug' : 'id');
      } catch (err) {
        console.error('Error fetching product:', err);
        throw err;
      }
    },
    enabled: !!id
  });
  
  // Fetch related products using cached data when possible
  const { data: relatedProductsData } = useQuery({
    queryKey: ['relatedProducts', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      try {
        // First check if we have products in cache
        const cachedProducts = queryClient.getQueryData(['products']);
        if (cachedProducts?.products) {
          const relatedProducts = cachedProducts.products
            .filter((p: Product) => p.category === product.category && p._id !== product._id)
            .slice(0, 4);
          if (relatedProducts.length > 0) {
            console.log('Using cached related products');
            return relatedProducts;
          }
        }

        // If not enough in cache, fetch from API
        console.log('Fetching related products from API');
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
  
  // Set default selected size when product loads
  useEffect(() => {
    if (product) {
      if (product.hasMultipleSizes && product.sizes && product.sizes.length > 0) {
        // Default to first available size for multi-size products
        const defaultSize = product.sizes.find(s => s.inStock) || product.sizes[0];
        setSelectedSize(defaultSize.size);
      } else {
        // For single-price products, no size selection needed
        setSelectedSize('');
      }
    }
  }, [product]);
  
  // Get current price based on selected size
  const getCurrentPrice = (): { price: number, salePrice?: number, inStock: boolean } => {
    if (!product) return { price: 0, inStock: false };
    
    if (product.hasMultipleSizes && product.sizes && product.sizes.length > 0) {
      const sizeInfo = product.sizes.find(s => s.size === selectedSize);
      if (sizeInfo) {
        return { 
          price: sizeInfo.price, 
          salePrice: sizeInfo.salePrice,
          inStock: sizeInfo.inStock 
        };
      }
    }
    
    return { 
      price: product.basePrice, 
      salePrice: product.baseSalePrice,
      inStock: product.inStock 
    };
  };
  
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
    if (product.hasMultipleSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    const currentPrice = getCurrentPrice();
    addItem({
      ...product,
      selectedSize: product.hasMultipleSizes ? selectedSize : null,
      price: currentPrice.price,
      salePrice: currentPrice.salePrice
    }, selectedSize, quantity);
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
  
  // Video modal component
  const VideoModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean; onClose: () => void; videoUrl: string }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative w-full max-w-4xl mx-4">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white hover:text-gray-300"
          >
            Close
          </button>
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
            autoPlay
          />
        </div>
      </div>
    );
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
            <ProductMediaCarousel
              mainImage={product.image}
              additionalImages={product.images || []}
              video={product.video}
            />
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
              
              {/* Price Display */}
              <div className="mt-4">
                {product.hasMultipleSizes ? (
                  <>
                    <label htmlFor="size-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Size
                    </label>
                    <select
                      id="size-select"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      {product.sizes?.map((size) => (
                        <option key={size.size} value={size.size} disabled={!size.inStock}>
                          {size.size} - ₹{formatCurrency(size.price)}
                          {!size.inStock && " (Out of Stock)"}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{formatCurrency(product.basePrice)}
                    {product.baseSalePrice && (
                      <>
                        <span className="ml-2 text-lg line-through text-gray-500">
                          ₹{formatCurrency(product.baseSalePrice)}
                        </span>
                        <span className="ml-2 text-sm text-green-600">
                          {Math.round(((product.baseSalePrice - product.basePrice) / product.baseSalePrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                )}
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
            
            <div className="mt-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-gray-100 rounded-l-lg"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-gray-900">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-100 rounded-r-lg"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  variant="cardamom"
                  className="flex-1 py-6"
                  disabled={product.hasMultipleSizes && !selectedSize}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
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
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoUrl={product.video || ''}
      />
    </div>
  );
}
// function useEffect(arg0: () => void, arg1: any[]) {
//   throw new Error('Function not implemented.');
// }

