import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in on app start
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.log('No authenticated user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Sending login data:', { email, password });

      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      console.log('Login response:', response.data);
      const { user: userData } = response.data;

      setUser(userData);
      console.log('Login successful:', userData);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error response:', error.response?.data);

      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    console.log('User logged out');
  };

  const registerDoctor = async (doctorData) => {
    try {
      setLoading(true);
      console.log('Sending doctor registration data:', doctorData);

      const response = await api.post('/auth/register-doctor', doctorData);
      const { user: userData } = response.data;

      setUser(userData);
      console.log('Doctor registration successful:', userData);

      return { success: true };
    } catch (error) {
      console.error('Doctor registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerDoctor,
    fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
