import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getUserProfile } from '../services/UserService.ts';
import { toast } from '@/components/ui/sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
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
              const profile = await getUserProfile();
              
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
                logoutUser();
                setUser(null);
                toast.error('Your session has expired. Please log in again.');
              } else if (error?.response?.status === 500) {
                // Keep the user logged in with existing info on server errors
                toast.error('Could not refresh your profile. Using cached data.');
              }
            }
          } catch (parseError) {
            logoutUser();
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
      const userData = await loginUser(email, password);
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
      const userData = await registerUser(name, email, password);
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
    logoutUser();
    setUser(null);
    toast.success('Logged out successfully');
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
