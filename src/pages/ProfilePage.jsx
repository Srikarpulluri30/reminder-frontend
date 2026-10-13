import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Profile Page
 * Displays currently authenticated user's profile information.
 */
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Your personal account details and session info.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '1.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {initial}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{user?.name || 'User'}</h2>
              <span className="badge badge-upcoming" style={{ marginTop: '4px' }}>
                {user?.role || 'ROLE_USER'}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            🚪 Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">User ID</label>
            <input type="text" className="form-control" value={user?.id || 'N/A'} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={user?.name || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={user?.email || ''} readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={user?.role || 'ROLE_USER'} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
