import { Order, OrderStatus } from '../context/OrderContext';
import api from './api';

export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<Order[]> => {
    try {
      const { data } = await api.get<Order[]>('/orders');
      return data;
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      if (error.response?.status === 401) {
        return [];
      }
      throw new Error('Failed to fetch orders.');
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      return data;
    } catch (error: any) {
      console.error(`Error fetching order ${orderId}:`, error);
      
      // Check if the error is a 404 (Not Found)
      if (error.response?.status === 404) {
        throw new Error(`Order with ID ${orderId} not found.`);
      }
      
      // Check if the error is a 401 (Unauthorized)
      if (error.response?.status === 401) {
        throw new Error('You are not authorized to view this order.');
      }
      
      // Check if the error is a 500 (Server Error)
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      // If there's a specific error message from the server, use it
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to fetch order details.');
    }
  },

  // Get orders by user ID
  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const { data } = await api.get<Order[]>(`/orders/user/${userId}`);
      return data;
    } catch (error: any) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw new Error('Failed to fetch user orders.');
    }
  },
  
  // Get current user's orders
  getMyOrders: async (): Promise<Order[]> => {
    try {
      const { data } = await api.get<Order[]>('/orders/myorders');
      return data;
    } catch (error: any) {
      console.error('Error fetching my orders:', error);
      return [];
    }
  },

  // Create new order
  createOrder: async (
    orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> => {
    try {
      console.log('Creating order with data:', orderData);
      // Use the api instance instead of axios directly
      const { data } = await api.post<Order>('/orders', orderData);
      console.log('Order created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Failed to create order:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 500) {
        throw new Error('Server Error: Please try again later.');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Something went wrong while creating the order.');
    }
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus
  ): Promise<Order> => {
    try {
      const { data } = await api.put<Order>(
        `/orders/${orderId}/status`,
        { status }
      );
      return data;
    } catch (error: any) {
      console.error(`Error updating order status for ${orderId}:`, error);
      throw new Error('Failed to update order status.');
    }
  },

  // Update payment status
  updatePaymentStatus: async (
    orderId: string,
    status: 'completed' | 'failed',
    paymentId?: string
  ): Promise<Order> => {
    try {
      const { data } = await api.patch<Order>(
        `/orders/${orderId}/payment`,
        { status, paymentId }
      );
      return data;
    } catch (error: any) {
      console.error(`Error updating payment status for ${orderId}:`, error);
      throw new Error('Failed to update payment status.');
    }
  },
};

export default orderService;
