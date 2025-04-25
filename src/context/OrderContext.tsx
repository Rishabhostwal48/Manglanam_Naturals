import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { orderService } from '@/services/orderService';
import { CartItem } from './CartContext';

// Define types for orders
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';

export interface OrderAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  _id: string;
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'razorpay' | 'cash-on-delivery';
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
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  createOrder: (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  getUserOrders: (userId: string) => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: 'completed' | 'failed', paymentId?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Sample orders data
const initialOrders: Order[] = [
  { 
    _id: "ORD-001", 
    user: {
      _id: "CUST-001",
      name: "John Doe",
      email: "john.doe@example.com"
    },
    orderItems: [
      { 
        _id: "ITEM-001",
        product: "1",
        name: "Premium Turmeric Powder",
        price: 12.99,
        quantity: 2,
        image: "/images/products/turmeric.jpg"
      },
      {
        _id: "ITEM-002",
        product: "3",
        name: "Organic Cinnamon Sticks",
        price: 8.99,
        quantity: 1,
        image: "/images/products/cinnamon.jpg"
      }
    ],
    status: "delivered", 
    shippingAddress: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      address: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA"
    },
    paymentMethod: "razorpay",
    itemsPrice: 34.97,
    taxPrice: 3.50,
    shippingPrice: 5.00,
    totalPrice: 43.47,
    isPaid: true,
    paidAt: new Date("2025-04-05"),
    isDelivered: true,
    deliveredAt: new Date("2025-04-06"),
    createdAt: "2025-04-05T10:00:00Z",
    updatedAt: "2025-04-06T15:00:00Z"
  },
  { 
    _id: "ORD-002",
    user: {
      _id: "CUST-002",
      name: "Jane Smith",
      email: "jane.smith@example.com"
    },
    orderItems: [
      { 
        _id: "ITEM-003",
        product: "2",
        name: "Saffron Threads",
        price: 24.99,
        quantity: 1,
        image: "/images/products/saffron.jpg"
      },
      { 
        _id: "ITEM-004",
        product: "5",
        name: "Cardamom Pods",
        price: 12.99,
        quantity: 1,
        image: "/images/products/cardamom.jpg"
      }
    ],
    status: "processing",
    shippingAddress: {
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "9876543210",
      address: "456 Oak Ave",
      city: "Somewhere",
      postalCode: "67890",
      country: "USA"
    },
    paymentMethod: "cash-on-delivery",
    itemsPrice: 37.98,
    taxPrice: 3.80,
    shippingPrice: 5.00,
    totalPrice: 46.78,
    isPaid: false,
    isDelivered: false,
    createdAt: "2025-04-05T12:00:00Z",
    updatedAt: "2025-04-05T12:00:00Z"
  },
  { 
    _id: "ORD-003", 
    user: {
      _id: "CUST-003",
      name: "Robert Johnson",
      email: "robert.johnson@example.com"
    },
    orderItems: [
      { 
        _id: "ITEM-005",
        product: "4",
        name: "Black Peppercorns",
        price: 9.99,
        quantity: 3,
        image: "/images/products/black-pepper.jpg"
      },
      { 
        _id: "ITEM-006",
        product: "6",
        name: "Cloves",
        price: 8.99,
        quantity: 2,
        image: "/images/products/cloves.jpg"
      },
      { 
        _id: "ITEM-007",
        product: "1",
        name: "Premium Turmeric Powder",
        price: 12.99,
        quantity: 1,
        image: "/images/products/turmeric.jpg"
      }
    ],
    status: "shipped",
    shippingAddress: {
      fullName: "Robert Johnson",
      email: "robert.johnson@example.com",
      phone: "",
      street: "789 Pine Blvd",
      city: "Elsewhere",
      state: "TX",
      zipCode: "54321",
      country: "USA"
    },
    paymentMethod: "razorpay",
    itemsPrice: 59.94,
    taxPrice: 6.00,
    shippingPrice: 5.00,
    totalPrice: 70.94,
    isPaid: true,
    paidAt: new Date("2025-04-04"),
    isDelivered: true,
    deliveredAt: new Date("2025-04-05"),
    createdAt: "2025-04-04T10:00:00Z",
    updatedAt: "2025-04-05T15:00:00Z"
  },
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getAllOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to fetch orders. Please try again later.');
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const createOrder = async (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    try {
      setLoading(true);
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [...prev, newOrder]);
      toast.success("Order placed successfully!");
      return newOrder;
    } catch (err) {
      console.error('Failed to create order:', err);
      toast.error('Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (err) {
      console.error('Failed to fetch order:', err);
      toast.error('Failed to fetch order details');
      return null;
    }
  };

  const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
      const userOrders = await orderService.getUserOrders(userId);
      return userOrders;
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
      toast.error('Failed to fetch your orders');
      return [];
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? updatedOrder : order
        )
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
      toast.error('Failed to update order status');
      throw err;
    }
  };

  const updatePaymentStatus = async (orderId: string, status: 'completed' | 'failed', paymentId?: string): Promise<void> => {
    try {
      const updatedOrder = await orderService.updatePaymentStatus(orderId, status, paymentId);
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? updatedOrder : order
        )
      );
      toast.success(`Payment status updated to ${status}`);
    } catch (err) {
      console.error('Failed to update payment status:', err);
      toast.error('Failed to update payment status');
      throw err;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        createOrder,
        getOrderById,
        getUserOrders,
        updateOrderStatus,
        updatePaymentStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
