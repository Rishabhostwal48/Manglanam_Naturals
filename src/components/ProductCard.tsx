
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-md">
      {/* Product Badge for Featured or Best Seller */}
      {(product.featured || product.bestSeller || product.salePrice) && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {product.bestSeller && (
            <span className="inline-block bg-turmeric px-2 py-1 text-xs font-medium rounded-full text-turmeric-foreground">
              Best Seller
            </span>
          )}
          {product.featured && (
            <span className="inline-block bg-cardamom px-2 py-1 text-xs font-medium rounded-full text-cardamom-foreground">
              Featured
            </span>
          )}
          {product.salePrice && (
            <span className="inline-block bg-destructive px-2 py-1 text-xs font-medium rounded-full text-destructive-foreground">
              Sale
            </span>
          )}
        </div>
      )}
      
      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
        <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
      </button>
      
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace('-', ' ')}
        </h3>
        
        <Link to={`/product/${product.id}`} className="mt-1">
          <h2 className="text-lg font-playfair font-medium">{product.name}</h2>
        </Link>
        
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <div>
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium">{formatCurrency(product.salePrice)}</p>
                  <p className="text-sm text-gray-500 line-through">{formatCurrency(product.price)}</p>
                </div>
              ) : (
                <p className="text-lg font-medium">{formatCurrency(product.price)}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="cardamom"
              rounded="full"
              onClick={() => addItem(product)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
