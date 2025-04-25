
import api from './api';

// User API
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/users/login', { email, password });
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/users', { name, email, password });
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
};

// Update the getUserProfile function to return the data
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
