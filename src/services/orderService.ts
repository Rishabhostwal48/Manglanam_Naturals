import axios from 'axios';
import { Order, OrderStatus } from '@/context/OrderContext';

const API_URL = '/api';

export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await axios.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  },

  // Get orders by user ID
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders/user/${userId}`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, status: 'completed' | 'failed', paymentId?: string): Promise<Order> => {
    const response = await axios.patch(`${API_URL}/orders/${orderId}/payment`, { 
      status, 
      paymentId 
    });
    return response.data;
  }
}; 