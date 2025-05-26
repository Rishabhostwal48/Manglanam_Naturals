import axios, { AxiosError } from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://manglanam-server.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Enable sending cookies with requests
});

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Request Interceptor - Attach Token
api.interceptors.request.use((config) => {
  const token = getToken();
  console.log('Request interceptor - Token:', token ? 'Present' : 'Missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization);
  }
  return config;
}, Promise.reject);

// Response Interceptor - Handle Errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    // If the response contains file paths, convert them to absolute URLs
    if (response.data) {
      const processFileUrl = (url: string) => {
        if (!url) return url;
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL}${url}`;
      };

      if (response.data.image) {
        response.data.image = processFileUrl(response.data.image);
      }
      if (response.data.images) {
        response.data.images = response.data.images.map(processFileUrl);
      }
      if (response.data.video) {
        response.data.video = processFileUrl(response.data.video);
      }
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    if (error.response) {
      const { status, data } = error.response as { status: number; data: any };

      if ([401, 403].includes(status)) {
        clearAuthData();
        // Optional: window.location.href = '/login';
      }

      // Handle server errors silently in production
      if (status === 500 && process.env.NODE_ENV !== "production") {
        // Only log in development
      }
    }
    return Promise.reject(error);
  }
);

// --- Helper Functions ---
function getToken(): string | null {
  const userToken = localStorage.getItem("userToken");
  if (userToken) return userToken;

  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    try {
      return JSON.parse(userInfo)?.token || null;
    } catch (error) {
      console.error("Failed to parse userInfo", error);
    }
  }
  return null;
}

function clearAuthData() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("cartItems");
}

// --- Services ---

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/users/login", { email, password });
    saveAuthData(data);
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post("/users", { name, email, password });
    saveAuthData(data);
    return data;
  },

  logout: clearAuthData,

  getUserProfile: async () => (await api.get("/users/profile")).data,

  updateUserProfile: async (userData: Record<string, any>) =>
    (await api.put("/users/profile", userData)).data,
};

function saveAuthData(data: any) {
  localStorage.setItem("userToken", data.token);
  localStorage.setItem("userInfo", JSON.stringify(data));
}

export const productService = {
  getProducts: async (params?: Record<string, any>) =>
    (await api.get("/products", { params })).data,

  getProductById: async (idOrSlug: string, type: "id" | "slug" = "id") => {
    const endpoint =
      type === "id" ? `/products/id/${idOrSlug}` : `/products/slug/${idOrSlug}`;
    return (await api.get(endpoint)).data;
  },

  getProductsByIds: async (ids: string[]) => {
    return (await api.get("/products/by-ids", { params: { ids: ids.join(',') } })).data;
  },

  getFeaturedProducts: async () => (await api.get("/products/featured")).data,

  getBestSellers: async () => (await api.get("/products/bestsellers")).data,

  createProduct: async (productData: Record<string, any>) =>
    (await api.post("/products", productData)).data,

  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) =>
    (await api.delete(`/products/${id}`)).data,

  uploadProductImage: async (formData: FormData) =>
    (
      await api.post("/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,

  uploadProductVideo: async (formData: FormData) =>
    (
      await api.post("/products/upload-video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data,
  uploadToCloudinary: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url;
  },
};

export const orderService = {
  createOrder: async (orderData: Record<string, any>) =>
    (await api.post("/orders", orderData)).data,

  getOrderById: async (id: string) => (await api.get(`/orders/${id}`)).data,

  getUserOrders: async () => (await api.get("/orders/myorders")).data,

  getAllOrders: async () => (await api.get("/orders")).data,

  updateOrderStatus: async (id: string, status: string) =>
    (await api.put(`/orders/${id}/status`, { status })).data,

  updateOrderToPaid: async (id: string, paymentResult: Record<string, any>) =>
    (await api.put(`/orders/${id}/pay`, paymentResult)).data,

  getMyOrders: async () => (await api.get("/orders/myorders")).data,
};

export const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },
};

export default api;
