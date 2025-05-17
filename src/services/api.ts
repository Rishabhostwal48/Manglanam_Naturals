// src/api/api.ts

import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://manglanam-naturals.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach Token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

// Response Interceptor - Handle Errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response as { status: number; data: any };
      
      if ([401, 403].includes(status)) {
        clearAuthData();
        // Optional: window.location.href = '/login';
      }
      
      // Handle server errors silently in production
      if (status === 500 && process.env.NODE_ENV !== 'production') {
        // Only log in development
      }
    }
    return Promise.reject(error);
  }
);

// --- Helper Functions ---
function getToken(): string | null {
  const userToken = localStorage.getItem('userToken');
  if (userToken) return userToken;

  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo)?.token || null;
    } catch (error) {
      console.error('Failed to parse userInfo', error);
    }
  }
  return null;
}

function clearAuthData() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
}

// --- Services ---

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/users/login', { email, password });
    saveAuthData(data);
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/users', { name, email, password });
    saveAuthData(data);
    return data;
  },

  logout: clearAuthData,

  getUserProfile: async () => (await api.get('/users/profile')).data,

  updateUserProfile: async (userData: Record<string, any>) =>
    (await api.put('/users/profile', userData)).data,
};

function saveAuthData(data: any) {
  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data));
}

export const productService = {
  getProducts: async (params?: Record<string, any>) =>
    (await api.get('/products', { params })).data,

  getProductById: async (idOrSlug: string) => {
    try {
      // First try to get by ID directly, as this is the most common case for admin pages
      return (await api.get(`/products/${idOrSlug}`)).data;
    } catch (error) {
      console.log('Failed to get product by ID, trying slug endpoint...');
      // If that fails, try the slug endpoint
      return (await api.get(`/products/slug/${idOrSlug}`)).data;
    }
  },

  getFeaturedProducts: async () => (await api.get('/products/featured')).data,

  getBestSellers: async () => (await api.get('/products/bestsellers')).data,

  createProduct: async (productData: Record<string, any>) =>
    (await api.post('/products', productData)).data,

  updateProduct: async (id: string, productData: Record<string, any>) =>
    (await api.put(`/products/${id}`, productData)).data,

  deleteProduct: async (id: string) => (await api.delete(`/products/${id}`)).data,

  uploadProductImage: async (formData: FormData) =>
    (await api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,
    
  uploadProductVideo: async (formData: FormData) =>
    (await api.post('/products/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,
};

export const orderService = {
  createOrder: async (orderData: Record<string, any>) =>
    (await api.post('/orders', orderData)).data,

  getOrderById: async (id: string) => (await api.get(`/orders/${id}`)).data,

  getUserOrders: async () => (await api.get('/orders/myorders')).data,

  getAllOrders: async () => (await api.get('/orders')).data,

  updateOrderStatus: async (id: string, status: string) =>
    (await api.put(`/orders/${id}/status`, { status })).data,

  updateOrderToPaid: async (id: string, paymentResult: Record<string, any>) =>
    (await api.put(`/orders/${id}/pay`, paymentResult)).data,

  getMyOrders: async () => (await api.get('/orders/myorders')).data,
};

export default api;
