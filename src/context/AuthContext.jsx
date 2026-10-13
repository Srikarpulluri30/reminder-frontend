import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Manages global authentication state, token persistence in localStorage,
 * and seamless login/register/logout actions.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved credentials from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('smart_reminder_token');
    const savedUser = localStorage.getItem('smart_reminder_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('smart_reminder_token');
        localStorage.removeItem('smart_reminder_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login action: calls backend API, stores JWT and user profile
   */
  const login = async (email, password) => {
    const data = await authService.login(email.trim().toLowerCase(), password);
    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || 'ROLE_USER',
    };

    setToken(data.token);
    setUser(userData);

    localStorage.setItem('smart_reminder_token', data.token);
    localStorage.setItem('smart_reminder_user', JSON.stringify(userData));

    return data;
  };

  /**
   * Register action: calls backend API and automatically logs user in!
   */
  const register = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    
    // 1. Create account on backend
    await authService.register(cleanName, cleanEmail, password);
    
    // 2. Automatically sign in immediately so user goes straight to dashboard
    return await login(cleanEmail, password);
  };

  /**
   * Logout action: clears session state and localStorage
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_reminder_token');
    localStorage.removeItem('smart_reminder_user');
  };

  const isAdmin = Boolean(
    user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN')
  );

  const value = {
    user,
    token,
    isAdmin,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume AuthContext cleanly in any component
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
