import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export function Cart() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, updateQuantity, cartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-40"
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 max-w-full bg-white shadow-xl z-50 
                    flex flex-col animate-slide-in-right`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold font-playfair">Your Cart</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-6 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Your cart is empty</h3>
              <p className="text-muted-foreground mt-1">Add some spices to get started</p>
              <Button 
                className="mt-6" 
                onClick={() => {
                  closeCart();
                }}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.product._id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium">
                        <h3>
                          <a href={`/product/${item.product._id}`}>{item.product.name}</a>
                        </h3>
                        <p className="ml-4">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                      
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.product.weight}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center border rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {/* Remove Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-sm text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.product._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {items.length > 0 && (
          <>
            {/* Summary */}
            <div className="border-t px-6 py-4">
              <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>{formatCurrency(cartTotal)}</p>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            
            {/* Actions */}
            <div className="border-t px-6 py-4">
              <Button className="w-full mb-3" size="lg" onClick={() => {
                closeCart();
                navigate('/checkout');
              }}>
                Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
