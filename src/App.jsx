import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Layout from './components/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import RemindersPage from './pages/RemindersPage';
import AddReminderPage from './pages/AddReminderPage';
import EditReminderPage from './pages/EditReminderPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Main Application Routing Component
 * Configured with AuthProvider and ProtectedRoute boundaries including RBAC rules.
 */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes (Requires valid JWT login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="reminders/new" element={<AddReminderPage />} />
              <Route path="reminders/edit/:id" element={<EditReminderPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Admin-only Protected Route */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
