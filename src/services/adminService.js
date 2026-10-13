import api from './api';

/**
 * Admin API Service
 * 
 * Provides administrative API calls restricted to users with ROLE_ADMIN.
 */

/**
 * Get all registered users in the system (ADMIN only).
 */
export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

/**
 * Get global system metrics (ADMIN only).
 */
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
