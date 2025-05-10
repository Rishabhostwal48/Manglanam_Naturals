import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Product } from "../data/products";
import { toast } from '@/components/ui/sonner';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shippingAddress: ShippingAddress | null;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: { address: ShippingAddress } }
  | { type: 'SET_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  isOpen: false,
  shippingAddress: null,
};

// Helper function to normalize product ID for consistent comparison
const normalizeProductId = (productId: any): string => {
  if (!productId) return '';
  
  // If it's already a string, return it
  if (typeof productId === 'string') return productId;
  
  // If it's an object with toString method
  if (typeof productId === 'object' && productId !== null) {
    if (typeof productId.toString === 'function') {
      const idString = productId.toString();
      // Make sure it's not the generic [object Object]
      if (idString !== '[object Object]') return idString;
    }
  }
  
  // Fallback
  return '';
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Normalize the product ID for consistent comparison
      const productId = normalizeProductId(action.payload.product._id);
      
      // Find existing item by normalized ID
      const existingItem = state.items.find(item => 
        normalizeProductId(item.product._id) === productId
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            normalizeProductId(item.product._id) === productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { product: action.payload.product, quantity: action.payload.quantity }],
      };
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => 
          normalizeProductId(item.product._id) !== action.payload.productId
        ),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          normalizeProductId(item.product._id) === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    
    case 'OPEN_CART': {
      return { ...state, isOpen: true };
    }
    
    case 'CLOSE_CART': {
      return { ...state, isOpen: false };
    }
    
    case 'SET_SHIPPING_ADDRESS': {
      return {
        ...state,
        shippingAddress: action.payload.address,
      };
    }
    
    case 'SET_CART': {
      return action.payload;
    }
    
    default:
      return state;
  }
};

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
}

export interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: number;
  subtotal: number;
  checkout: (paymentMethod: string) => Promise<void>;
  cartCount: number;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [loading, setLoading] = useState(false);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('manglanam-cart');
        if (savedCart) {
          const { items } = JSON.parse(savedCart);
          if (Array.isArray(items) && items.length > 0) {
            // Instead of dispatching ADD_ITEM for each item (which would trigger multiple renders),
            // we'll create a new state with all items at once
            const newState = {
              ...state,
              items: items.filter(item => item.product && item.quantity)
            };
            
            // Use a custom action to set the entire cart state at once
            dispatch({ type: 'SET_CART', payload: newState });
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Use a separate effect for toast to avoid React warnings
        setTimeout(() => toast.error('Failed to load your cart'), 0);
      }
    };

    loadCart();
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('manglanam-cart', JSON.stringify({ items: state.items }));
    } catch (error) {
      setTimeout(() => toast.error('Failed to save your cart'), 0);
    }
  }, [state.items]);
  
  const addItem = (product: Product, quantity: number = 1) => {
    try {
      // Ensure product has a valid string ID before adding to cart
      const normalizedProduct = {
        ...product,
        _id: typeof product._id === 'object' 
          ? (product._id?.toString() || product.id?.toString() || Math.random().toString()) 
          : (product._id || product.id || Math.random().toString())
      };
      
      // Check if the product already exists in the cart
      const productId = normalizeProductId(normalizedProduct._id);
      const existingItem = state.items.find(item => 
        normalizeProductId(item.product._id) === productId
      );
      
      // Dispatch the action to add the item
      dispatch({ type: 'ADD_ITEM', payload: { product: normalizedProduct, quantity } });
      
      // Show a toast notification in a separate effect to avoid React warnings
      const message = existingItem 
        ? `Updated ${product.name} quantity in cart` 
        : `Added ${product.name} to cart`;
      
      // Use setTimeout to move the toast call out of the render phase
      setTimeout(() => toast.success(message), 0);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setTimeout(() => toast.error('Failed to add item to cart'), 0);
    }
  };
  
  const removeItem = (productId: string) => {
    try {
      // Find the product name for the toast message
      const item = state.items.find(item => normalizeProductId(item.product._id) === productId);
      const productName = item ? item.product.name : 'Item';
      
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
      
      // Show toast outside of render phase
      setTimeout(() => toast.success(`${productName} removed from cart`), 0);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setTimeout(() => toast.error('Failed to remove item from cart'), 0);
    }
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        removeItem(productId);
        return;
      }
      
      // Find the product name for the toast message
      const item = state.items.find(item => normalizeProductId(item.product._id) === productId);
      const productName = item ? item.product.name : 'Item';
      
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
      
      // Show toast outside of render phase
      setTimeout(() => toast.success(`Updated ${productName} quantity`), 0);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setTimeout(() => toast.error('Failed to update quantity'), 0);
    }
  };
  
  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      
      // Show toast outside of render phase
      setTimeout(() => toast.success('Cart cleared'), 0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setTimeout(() => toast.error('Failed to clear cart'), 0);
    }
  };
  
  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };
  
  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };
  
  // Calculate cart total
  const cartTotal = state.items.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );
  
  // Calculate subtotal (same as cartTotal in this case)
  const subtotal = cartTotal;

  // Calculate cart count
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const checkout = async (paymentMethod: string) => {
    try {
      setLoading(true);

      // Simplified helper function to get a consistent string ID from a product
      const getProductId = (product: any): string => {
        if (!product) return 'unknown';
        
        // If product is already a string, return it
        if (typeof product === 'string') return product;
        
        // If product has an _id field
        if (product._id) {
          // If _id is a string, use it directly
          if (typeof product._id === 'string') return product._id;
          
          // If _id is an object with toString method, use that
          if (product._id && typeof product._id.toString === 'function') {
            return product._id.toString();
          }
        }
        
        // Fallback to id field if available
        if (product.id) {
          if (typeof product.id === 'string') return product.id;
          if (typeof product.id.toString === 'function') return product.id.toString();
        }
        
        // Last resort
        return 'unknown';
      };

      // Create order items from cart items with product ID as string
      const orderItems = state.items.map(item => ({
        product: getProductId(item.product),
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      // In a real implementation, you would send this data to your backend
      // For now, we'll just simulate a successful checkout
      console.log('Processing checkout with items:', orderItems);
      
      // Here you would typically make an API call to create the order
      // const orderResponse = await orderService.createOrder({
      //   orderItems,
      //   shippingAddress: state.shippingAddress,
      //   paymentMethod,
      //   itemsPrice: subtotal,
      //   totalPrice: cartTotal
      // });

      setLoading(false);
      return Promise.resolve();
    } catch (error) {
      setLoading(false);
      setTimeout(() => toast.error('Checkout failed. Please try again.'), 0);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        cartTotal,
        subtotal,
        checkout,
        cartCount,
        shippingAddress: state.shippingAddress,
        setShippingAddress: (address: ShippingAddress) => dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: { address } }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
