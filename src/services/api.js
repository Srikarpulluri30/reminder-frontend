import axios from 'axios';

/**
 * Axios API Client Configuration
 * 
 * Automatically attaches JWT Bearer token from localStorage to all requests
 * and handles global 401 Unauthorized responses.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 1. Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_reminder_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Intercept 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected page, clear invalid session and redirect to login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('smart_reminder_token');
        localStorage.removeItem('smart_reminder_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
