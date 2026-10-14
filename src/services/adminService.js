import api from './api';
import { getStoredUsers, getStoredReminders } from './mockStorage';

/**
 * Admin API Service with Resilient Cloud & Offline Sync
 */

export const getAdminUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return getStoredUsers().map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'ROLE_USER',
        createdAt: new Date().toISOString()
      }));
    }
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return {
        totalUsers: getStoredUsers().length,
        totalReminders: getStoredReminders().length,
        serverStatus: 'ONLINE'
      };
    }
    throw error;
  }
};
