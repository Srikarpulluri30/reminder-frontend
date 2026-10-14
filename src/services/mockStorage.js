/**
 * Resilient Offline Storage & Demo Engine
 * 
 * Guarantees zero failures and a 100% working application even when the cloud
 * backend is sleeping, deploying, or blocked by browser mixed-content restrictions.
 */

const USERS_KEY = 'smart_reminder_offline_users';
const REMINDERS_KEY = 'smart_reminder_offline_reminders';

const DEFAULT_USERS = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', password: 'password123', role: 'ROLE_USER' },
  { id: 2, name: 'Alex Smith', email: 'user@example.com', password: 'password123', role: 'ROLE_USER' },
  { id: 3, name: 'System Admin', email: 'admin@example.com', password: 'admin123', role: 'ROLE_ADMIN' }
];

const getToday = () => new Date();
const formatDate = (d) => d.toISOString().split('T')[0];
const addMonths = (d, m) => { const n = new Date(d); n.setMonth(n.getMonth() + m); return n; };
const addDays = (d, days) => { const n = new Date(d); n.setDate(n.getDate() + days); return n; };

const DEFAULT_REMINDERS = [
  {
    id: 101,
    title: 'International Passport Renewal',
    description: 'Passport renewal required for upcoming travel. Apply via online portal.',
    category: 'PASSPORT',
    expiryDate: formatDate(addMonths(getToday(), 6)),
    reminderDays: 30,
    reminderDate: formatDate(addDays(addMonths(getToday(), 6), -30)),
    status: 'UPCOMING',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    title: 'Comprehensive Vehicle Insurance',
    description: 'Policy #AX-98213 policy renewal with roadside assistance add-on.',
    category: 'INSURANCE',
    expiryDate: formatDate(addDays(getToday(), 10)),
    reminderDays: 14,
    reminderDate: formatDate(addDays(addDays(getToday(), 10), -14)),
    status: 'DUE_SOON',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    title: 'Driving Licence Card Expiry',
    description: 'Biometric smart-card driving licence renewal at local transport office.',
    category: 'LICENCE',
    expiryDate: formatDate(addDays(getToday(), -3)),
    reminderDays: 15,
    reminderDate: formatDate(addDays(addDays(getToday(), -3), -15)),
    status: 'EXPIRED',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 104,
    title: 'Cloud Developer Pro Subscription',
    description: 'Annual cloud computing and certification practice lab subscription.',
    category: 'SUBSCRIPTION',
    expiryDate: formatDate(addMonths(getToday(), 2)),
    reminderDays: 7,
    reminderDate: formatDate(addDays(addMonths(getToday(), 2), -7)),
    status: 'UPCOMING',
    userId: 1,
    createdAt: new Date().toISOString()
  }
];

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
};

export const getStoredReminders = () => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
      return DEFAULT_REMINDERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REMINDERS;
  }
};

export const saveStoredReminders = (reminders) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

export const mockLogin = (email, password) => {
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.response = { status: 401, data: { message: 'Invalid email or password. Please check your credentials.' } };
    throw err;
  }

  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  return {
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'ROLE_USER'
  };
};

export const mockRegister = (name, email, password) => {
  const users = getStoredUsers();
  const cleanEmail = email.trim().toLowerCase();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    const err = new Error('Email already registered.');
    err.response = { status: 409, data: { message: 'A user with this email address already exists.' } };
    throw err;
  }

  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password,
    role: 'ROLE_USER'
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  return {
    token,
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };
};

export const mockGetReminders = (params = {}) => {
  let reminders = getStoredReminders();

  if (params.status) {
    reminders = reminders.filter(r => r.status === params.status);
  }
  if (params.category) {
    reminders = reminders.filter(r => r.category === params.category);
  }
  if (params.search) {
    const s = params.search.toLowerCase();
    reminders = reminders.filter(r =>
      (r.title && r.title.toLowerCase().includes(s)) ||
      (r.description && r.description.toLowerCase().includes(s))
    );
  }

  const sortBy = params.sortBy || 'expiryDate';
  const sortDir = params.sortDir || 'asc';
  reminders.sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortDir === 'desc') return valB.localeCompare(valA);
    return valA.localeCompare(valB);
  });

  const page = parseInt(params.page || 0, 10);
  const size = parseInt(params.size || 10, 10);
  const totalElements = reminders.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const start = page * size;
  const content = reminders.slice(start, start + size);

  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size
  };
};

export const mockCreateReminder = (reminderData) => {
  const reminders = getStoredReminders();
  const expiry = new Date(reminderData.expiryDate);
  const days = parseInt(reminderData.reminderDays || 0, 10);
  const alertDate = new Date(expiry);
  alertDate.setDate(alertDate.getDate() - days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expCheck = new Date(reminderData.expiryDate);
  expCheck.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expCheck - today) / (1000 * 60 * 60 * 24));

  let status = 'UPCOMING';
  if (diffDays < 0) status = 'EXPIRED';
  else if (diffDays <= days) status = 'DUE_SOON';

  const newReminder = {
    id: Date.now(),
    title: reminderData.title,
    description: reminderData.description || '',
    category: reminderData.category || 'OTHER',
    expiryDate: reminderData.expiryDate,
    reminderDays: days,
    reminderDate: formatDate(alertDate),
    status,
    createdAt: new Date().toISOString()
  };

  reminders.unshift(newReminder);
  saveStoredReminders(reminders);
  return newReminder;
};

export const mockUpdateReminder = (id, reminderData) => {
  const reminders = getStoredReminders();
  const index = reminders.findIndex(r => r.id === parseInt(id, 10) || r.id === id);

  if (index === -1) {
    const err = new Error('Reminder not found');
    err.response = { status: 404, data: { message: 'Reminder not found' } };
    throw err;
  }

  const expiry = new Date(reminderData.expiryDate);
  const days = parseInt(reminderData.reminderDays || 0, 10);
  const alertDate = new Date(expiry);
  alertDate.setDate(alertDate.getDate() - days);

  const updated = {
    ...reminders[index],
    ...reminderData,
    reminderDate: formatDate(alertDate),
    updatedAt: new Date().toISOString()
  };

  reminders[index] = updated;
  saveStoredReminders(reminders);
  return updated;
};

export const mockDeleteReminder = (id) => {
  let reminders = getStoredReminders();
  reminders = reminders.filter(r => r.id !== parseInt(id, 10) && r.id !== id);
  saveStoredReminders(reminders);
  return { success: true };
};

export const mockCompleteReminder = (id) => {
  const reminders = getStoredReminders();
  const reminder = reminders.find(r => r.id === parseInt(id, 10) || r.id === id);
  if (reminder) {
    reminder.status = 'COMPLETED';
    reminder.updatedAt = new Date().toISOString();
    saveStoredReminders(reminders);
    return reminder;
  }
  return null;
};
