import api from './api';
import {
  mockGetReminders,
  mockCreateReminder,
  mockUpdateReminder,
  mockDeleteReminder,
  mockCompleteReminder,
  getStoredReminders
} from './mockStorage';

/**
 * Reminder API Service with Resilient Cloud & Offline Sync
 * 
 * First attempts to communicate with Spring Boot endpoints.
 * If backend is unreachable, seamlessly handles operations in local storage.
 */

export const getReminders = async (params = {}) => {
  try {
    const response = await api.get('/reminders', { params });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return mockGetReminders(params);
    }
    throw error;
  }
};

export const getAllRemindersUnpaged = async () => {
  try {
    const response = await api.get('/reminders/all');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return getStoredReminders();
    }
    throw error;
  }
};

export const getUpcomingReminders = async () => {
  try {
    const response = await api.get('/reminders/upcoming');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return getStoredReminders().filter(r => r.status === 'UPCOMING');
    }
    throw error;
  }
};

export const getDueSoonReminders = async () => {
  try {
    const response = await api.get('/reminders/due-soon');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return getStoredReminders().filter(r => r.status === 'DUE_SOON');
    }
    throw error;
  }
};

export const getExpiredReminders = async () => {
  try {
    const response = await api.get('/reminders/expired');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return getStoredReminders().filter(r => r.status === 'EXPIRED');
    }
    throw error;
  }
};

export const getReminderById = async (id) => {
  try {
    const response = await api.get(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      const item = getStoredReminders().find(r => r.id === parseInt(id, 10) || r.id === id);
      if (item) return item;
    }
    throw error;
  }
};

export const createReminder = async (reminderData) => {
  try {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return mockCreateReminder(reminderData);
    }
    throw error;
  }
};

export const updateReminder = async (id, reminderData) => {
  try {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return mockUpdateReminder(id, reminderData);
    }
    throw error;
  }
};

export const deleteReminder = async (id) => {
  try {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return mockDeleteReminder(id);
    }
    throw error;
  }
};

export const markAsCompleted = async (id) => {
  try {
    const response = await api.patch(`/reminders/${id}/complete`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK') {
      return mockCompleteReminder(id);
    }
    throw error;
  }
};
