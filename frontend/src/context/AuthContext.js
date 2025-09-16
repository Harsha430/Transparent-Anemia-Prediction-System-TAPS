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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false); // action loading
  const [initialLoading, setInitialLoading] = useState(true); // startup

  // Load token from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
      api.setToken(stored);
    }
    fetchProfile();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      api.setToken(null);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.log('No authenticated user found');
      setUser(null);
    } finally {
      setInitialLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password
      });
      const { user: userData, access_token } = response.data;
      setUser(userData);
      if (access_token) {
        setToken(access_token);
        api.setToken(access_token);
        localStorage.setItem('auth_token', access_token);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      api.setToken(null);
      localStorage.removeItem('auth_token');
      setLoading(false);
    }
  };

  const registerDoctor = async (doctorData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register-doctor', doctorData);
      const { user: userData, access_token } = response.data;
      setUser(userData);
      if (access_token) {
        setToken(access_token);
        api.setToken(access_token);
        localStorage.setItem('auth_token', access_token);
      }
      return { success: true };
    } catch (error) {
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
    token,
    loading: loading || initialLoading,
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
