import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Displays user identity, dynamic avatar, and logout trigger.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="top-navbar">
      <div className="navbar-search">
        <span>🔍</span>
        <input type="text" placeholder="Search reminders..." readOnly />
      </div>

      <div className="navbar-user">
        {isAuthenticated ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{user?.name}</strong>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{user?.email}</small>
            </div>

            <Link to="/profile" className="user-avatar" title="View Profile">
              {initial}
            </Link>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ padding: '6px 12px' }}
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
