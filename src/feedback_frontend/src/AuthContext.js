// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from './AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const initAuth = async () => {
      try {
        const currentUser = await authService.getUser();
        if (currentUser && !currentUser.expired) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      await authService.login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthCallback = async () => {
    try {
      setIsLoading(true);
      const user = await authService.handleCallback();
      setUser(user);
      setIsAuthenticated(true);
      // Redirect to main app after successful login
      window.location.href = '/';
    } catch (error) {
      console.error('Auth callback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get access token for API calls
  const getAccessToken = async () => {
    return await authService.getAccessToken();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    handleAuthCallback,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};