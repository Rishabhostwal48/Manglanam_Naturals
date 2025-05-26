import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
  whatsappNumber?: string | null;
  preferWhatsapp?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: {
    name?: string;
    whatsappNumber?: string;
    preferWhatsapp?: boolean;
    password?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfoString = localStorage.getItem('userInfo');
        
        if (userInfoString) {
          try {
            const userInfo = JSON.parse(userInfoString);
            setUser(userInfo);
            
            try {
              const profile = await authService.getUserProfile();
              
              if (profile) {
                const updatedUserInfo = {
                  ...userInfo,
                  ...profile,
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                setUser(updatedUserInfo);
              }
            } catch (error) {
              // Only logout on authentication errors, not on server errors
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                authService.logout();
                setUser(null);
                toast.error('Your session has expired. Please log in again.');
              } else if (error?.response?.status === 500) {
                // Keep the user logged in with existing info on server errors
                toast.error('Could not refresh your profile. Using cached data.');
              }
            }
          } catch (parseError) {
            authService.logout();
            setUser(null);
          }
        } else {
          // No user info found
        }
      } catch (error) {
        // Error handling for user loading
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.login(email, password);
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      toast.success('Login successful');
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(error?.response?.data?.message || 'Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.register(name, email, password);
      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      toast.success('Registration successful');
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(error?.response?.data?.message || 'Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData: {
    name?: string;
    whatsappNumber?: string;
    preferWhatsapp?: boolean;
    password?: string;
  }) => {
    try {
      setLoading(true);
      const updatedUserData = await authService.updateUserProfile(userData);
      
      if (user) {
        const newUserData = {
          ...user,
          ...updatedUserData
        };
        
        setUser(newUserData);
        localStorage.setItem('userInfo', JSON.stringify(newUserData));
      }
      
      return updatedUserData;
    } catch (error: any) {
      if (error?.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to the server. Please check your internet connection.');
      } else {
        toast.error(error?.response?.data?.message || 'Profile update failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        userId: user?.id,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
