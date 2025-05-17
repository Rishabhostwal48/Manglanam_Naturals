import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { orderService } from '../services/orderService';

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
  price: number;
  quantity: number;
  image?: string;
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
}

// Define the shape of the context
interface OrderContextType {
  orderItems: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (id: string) => void;
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

  // Fetch all orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const result = await orderService.getAllOrders();
        setOrders(result);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const addItem = (item: OrderItem) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        return [...prev, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
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
      const result = await orderService.createOrder(orderData);
      // Add the new order to the orders state
      setOrders(prev => [result, ...prev]);
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get order by ID
  const getOrderById = async (orderId: string): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrderById(orderId);
      setLoading(false);
      return result;
    } catch (err: any) {
      setLoading(false);
      // Use the error message from the service if available
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

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
      // Update the order in the orders state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
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
