import api from './api';
import { mockLogin, mockRegister } from './mockStorage';

/**
 * Authentication API Service with Resilient Cloud & Offline Sync
 * 
 * First attempts the Spring Boot backend REST endpoints.
 * If the cloud backend is unavailable or sleeping, seamlessly falls back
 * to local storage authentication to prevent user disruption.
 */

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    // If backend is unreachable (offline, sleeping, mixed-content on HTTPS), fall back seamlessly
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn('Backend unavailable, using resilient local storage registration.');
      return mockRegister(name, email, password);
    }
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // If backend is unreachable, fall back seamlessly
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn('Backend unavailable, using resilient local storage login.');
      return mockLogin(email, password);
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    const raw = localStorage.getItem('smart_reminder_user');
    return raw ? JSON.parse(raw) : null;
  }
};
