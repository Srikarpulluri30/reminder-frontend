import api from './api';

/**
 * Reminder API Service
 * 
 * Handles all CRUD requests to the Spring Boot /api/reminders endpoints
 * with support for pagination, sorting, and status queries.
 */

/**
 * Get paginated and sorted reminders.
 * @param {Object} params - { page, size, sortBy, sortDir, category, status, search }
 */
export const getReminders = async (params = {}) => {
  const response = await api.get('/reminders', { params });
  return response.data;
};

/**
 * Get all reminders without pagination (useful for dashboard summary counts).
 */
export const getAllRemindersUnpaged = async () => {
  const response = await api.get('/reminders/all');
  return response.data;
};

export const getUpcomingReminders = async () => {
  const response = await api.get('/reminders/upcoming');
  return response.data;
};

export const getDueSoonReminders = async () => {
  const response = await api.get('/reminders/due-soon');
  return response.data;
};

export const getExpiredReminders = async () => {
  const response = await api.get('/reminders/expired');
  return response.data;
};

export const getReminderById = async (id) => {
  const response = await api.get(`/reminders/${id}`);
  return response.data;
};

export const createReminder = async (reminderData) => {
  const response = await api.post('/reminders', reminderData);
  return response.data;
};

export const updateReminder = async (id, reminderData) => {
  const response = await api.put(`/reminders/${id}`, reminderData);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminders/${id}`);
  return response.data;
};

export const markAsCompleted = async (id) => {
  const response = await api.patch(`/reminders/${id}/complete`);
  return response.data;
};
