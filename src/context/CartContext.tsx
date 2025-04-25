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
  | { type: 'SET_SHIPPING_ADDRESS'; payload: { address: ShippingAddress } };

const initialState: CartState = {
  items: [],
  isOpen: false,
  shippingAddress: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.product._id === action.payload.product._id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.product._id === action.payload.product._id
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
        items: state.items.filter(item => item.product._id !== action.payload.productId),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.product._id === action.payload.productId
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
  addItem: (product: Product, quantity: number) => void;
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
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (item.product && item.quantity) {
                dispatch({
                  type: 'ADD_ITEM',
                  payload: {
                    product: item.product,
                    quantity: item.quantity
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        toast.error('Failed to load your cart');
      }
    };

    loadCart();
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('manglanam-cart', JSON.stringify({ items: state.items }));
    } catch (error) {
      console.error('Failed to save cart:', error);
      toast.error('Failed to save your cart');
    }
  }, [state.items]);
  
  const addItem = (product: Product, quantity: number) => {
    try {
      dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };
  
  const removeItem = (productId: string) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };
  
  const updateQuantity = (productId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        removeItem(productId);
        return;
      }
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };
  
  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
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
      
      // Create order items from cart items
      const orderItems = state.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      // Clear the cart after successful checkout
      clearCart();
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Checkout failed:', error);
      toast.error('Checkout failed. Please try again.');
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
