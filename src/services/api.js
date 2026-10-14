import axios from 'axios';

/**
 * Resolves the active backend API Base URL:
 * 1. Checks localStorage for a user-specified custom URL (allows runtime connection to Render).
 * 2. Falls back to Vite environment variable VITE_API_BASE_URL.
 * 3. Defaults to 'http://localhost:8080/api' for local development.
 */
export const getApiBaseUrl = () => {
  const custom = localStorage.getItem('smart_reminder_api_url');
  if (custom && custom.trim()) {
    let clean = custom.trim();
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    if (!clean.endsWith('/api')) clean = clean + '/api';
    return clean;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

/**
 * Saves a custom backend URL to localStorage and updates active API client.
 */
export const setApiBaseUrl = (url) => {
  if (!url || !url.trim()) {
    localStorage.removeItem('smart_reminder_api_url');
  } else {
    let clean = url.trim();
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    if (!clean.endsWith('/api')) clean = clean + '/api';
    localStorage.setItem('smart_reminder_api_url', clean);
  }
};

/**
 * Tests connection to a backend API Base URL by querying /health
 */
export const testApiHealth = async (url) => {
  let target = url ? url.trim() : getApiBaseUrl();
  if (target.endsWith('/')) target = target.slice(0, -1);
  if (!target.endsWith('/api')) target = target + '/api';

  const res = await axios.get(`${target}/health`, { timeout: 8000 });
  return res.data;
};

/**
 * Axios API Client Configuration
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// 1. Request Interceptor: Dynamically resolve baseURL and attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
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
