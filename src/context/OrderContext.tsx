import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { orderService } from '../services/orderService';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// Define the type for a shipping address
export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Define the type for a single order item
export interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image: string;
}

// Define possible order statuses
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'cancelled';

// Define the Order type
export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: {
    _id: string;
    product: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingAddress: ShippingAddress & {
    whatsappNumber?: string;
    preferWhatsapp?: boolean;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  razorpayOrder?: any;
}

// Define the shape of the context
interface OrderContextType {
  orderItems: OrderItem[];
  addItem: (product: any, size: string, quantity?: number) => void;
  removeItem: (id: string, size: string) => void;
  clearOrder: () => void;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  orders: Order[];
  createOrder: (orderData: any) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  getMyOrders: () => Promise<Order[]>;
  getUserOrders: (userId: string) => Order[];
  getAllOrders: () => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  updatePaymentStatus: (orderId: string, status: 'completed' | 'failed', paymentId?: string) => Promise<Order>;
}

// Create the context with default undefined
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider props
interface OrderProviderProps {
  children: ReactNode;
}

// OrderContext Provider
export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCache, setOrderCache] = useState<Record<string, Order>>({});
  const { isAuthenticated, isAdmin } = useAuth();

  // Only fetch orders if user is authenticated and is admin
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !isAdmin) {
        return;
      }
      
      try {
        setLoading(true);
        const result = await orderService.getAllOrders();
        setOrders(result);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, isAdmin]);

  const addItem = (product: any, size: string, quantity: number = 1) => {
    const existingItem = orderItems.find(i => i.id === product._id && i.size === size);
    if (existingItem) {
      setOrderItems(prev => prev.map(i =>
        i.id === product._id && i.size === size ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      const sizeInfo = product.sizes.find((s: any) => s.size === size);
      if (!sizeInfo) {
        toast.error("Selected size not available");
        return;
      }
      const newItem: OrderItem = {
        id: product._id,
        name: product.name,
        size: size,
        price: sizeInfo.price,
        salePrice: sizeInfo.salePrice || undefined,
        quantity,
        image: product.image,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const removeItem = (id: string, size: string) => {
    setOrderItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Create a new order
  const createOrder = async (orderData: any): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const formattedOrderItems = orderItems.map((item) => ({
        product: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image,
      }));

      // Calculate total price
      const itemsPrice = formattedOrderItems.reduce(
        (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
        0
      );

      const totalPrice = itemsPrice + (orderData.taxPrice || 0) + (orderData.shippingPrice || 0);

      // Create order using the API instance
      const response = await api.post("/orders", {
        ...orderData,
        orderItems: formattedOrderItems,
        itemsPrice,
        totalPrice,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress
      });

      if (response.data) {
        // If payment method is Razorpay, create Razorpay order
        if (orderData.paymentMethod === 'razorpay') {
          const razorpayResponse = await api.post('/payments/create-razorpay-order', {
            orderId: response.data._id,
            amount: totalPrice * 100 // Razorpay expects amount in paise
          });
          
          return {
            ...response.data,
            razorpayOrder: razorpayResponse.data
          };
        }

        clearOrder();
        return response.data;
      }

      throw new Error('Failed to create order');
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Error creating order";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get order by ID with caching
  const getOrderById = async (orderId: string): Promise<Order> => {
    // Check cache first
    if (orderCache[orderId]) {
      return orderCache[orderId];
    }

    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrderById(orderId);
      // Update cache
      setOrderCache(prev => ({
        ...prev,
        [orderId]: result
      }));
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.message || err.response?.data?.message || 'Failed to fetch order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get all orders (admin)
  const getAllOrders = async (): Promise<Order[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getAllOrders();
      setOrders(result);
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get current user's orders
  const getMyOrders = async (): Promise<Order[]> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getMyOrders();
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get orders for a specific user
  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.user?._id === userId);
  };

  // Update order status with cache update
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      // Update both orders state and cache
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      setOrderCache(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], status }
      }));
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, status: 'completed' | 'failed', paymentId?: string): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.updatePaymentStatus(orderId, status, paymentId);
      // Update the order in the orders state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, paymentStatus: status, paymentId } : order
      ));
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to update payment status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orderItems, 
      addItem, 
      removeItem, 
      clearOrder, 
      totalAmount,
      loading,
      error,
      orders,
      createOrder,
      getOrderById,
      getMyOrders,
      getUserOrders,
      getAllOrders,
      updateOrderStatus,
      updatePaymentStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use the OrderContext
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
