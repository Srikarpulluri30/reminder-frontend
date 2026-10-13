import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * 
 * 1. Guards private routes from unauthenticated users.
 * 2. Enforces Role-Based Access Control (adminOnly routes).
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authorization..." />;
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but not an ADMIN when accessing adminOnly route -> Show Access Denied UI
  if (adminOnly && !isAdmin) {
    return (
      <div style={{ maxWidth: '580px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '8px' }}>
            403 Forbidden — Access Denied
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
            You do not have administrative privileges (<strong>ROLE_ADMIN</strong>) to access this page.
          </p>
          <Link to="/" className="btn btn-primary">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
