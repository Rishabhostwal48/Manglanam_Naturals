import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  whatsappNumber?: string;
  preferWhatsapp?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const { data } = await api.get<User[]>('/users');
      return data;
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      if (error.response?.status === 401) {
        return [];
      }
      throw new Error('Failed to fetch users.');
    }
  },

  // Get user profile
  getUserProfile: async (): Promise<User> => {
    try {
      const { data } = await api.get<User>('/users/profile');
      return data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile.');
    }
  },

  // Update user profile
  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const { data } = await api.put<User>('/users/profile', userData);
      return data;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile.');
    }
  },

  // Create admin user (admin only)
  createAdminUser: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    try {
      const { data } = await api.post<User>('/users/admin', userData);
      return data;
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user.');
    }
  }
};

export default userService;
