import axios from 'axios';

// Create axios instance with base URL and common headers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    // First try to get token directly
    let token = localStorage.getItem('userToken');
    
    // If no direct token, try to get it from userInfo
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          token = parsed.token;
        } catch (e) {
          console.error('Error parsing userInfo:', e);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data))
    }
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/users', { name, email, password });
    if (response.data) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems');
  },
  
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateUserProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
};

// Services for products
export const productService = {
  // Get all products
  getProducts: async (params: any = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by id
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  // Get bestseller products
  getBestSellers: async () => {
    const response = await api.get('/products/bestsellers');
    return response.data;
  },

  // Create product (admin)
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (admin)
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (admin)
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  // Upload product image
  uploadProductImage: async (formData: FormData) => {
    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Services for orders
export const orderService = {
  // Create new order
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get order by id
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Get user orders
  getUserOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  // Get all orders (admin)
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  // Update order status (admin)
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  // Update order to paid
  updateOrderToPaid: async (id: string, paymentResult: any) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },
  
  // Get my orders
  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },
};

export default api;
