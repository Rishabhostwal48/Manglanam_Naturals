import React, { createContext, useContext, useState, ReactNode } from 'react';
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
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define the Order type
export interface Order {
  _id: string;
  userId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  total: number;
  createdAt?: string;
  updatedAt?: string;
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
  createOrder: (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order>;
  getMyOrders: () => Promise<Order[]>;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
  const createOrder = async (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.createOrder(orderData);
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
      const errorMessage = err.response?.data?.message || 'Failed to fetch order';
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

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.updateOrderStatus(orderId, status);
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
      createOrder,
      getOrderById,
      getMyOrders,
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
