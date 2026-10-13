import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAdminUsers, getAdminStats } from '../services/adminService';
import { formatDate } from '../utils/dateUtils';

/**
 * AdminPage Component
 * 
 * Simple administrative dashboard for users with ROLE_ADMIN:
 * 1. Shows system-wide metrics (total users, total reminders).
 * 2. Displays list of all registered users with their roles.
 */
export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalReminders: 0, serverStatus: 'ONLINE' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, statsData] = await Promise.all([
        getAdminUsers(),
        getAdminStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin data. Ensure you have ROLE_ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Admin Management Panel</h1>
            <span style={{
              background: '#ede9fe',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              👑 ROLE_ADMIN
            </span>
          </div>
          <p className="page-subtitle">Manage users, view system-wide statistics, and monitor application activity.</p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchAdminData} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Admin System Metrics */}
      <div className="stats-grid">
        <StatCard label="Registered Users" value={stats.totalUsers || users.length} icon="👥" variant="primary" />
        <StatCard label="Total System Reminders" value={stats.totalReminders || 0} icon="📋" variant="info" />
        <StatCard label="System Status" value={stats.serverStatus || 'ONLINE'} icon="⚡" variant="success" />
      </div>

      {/* Registered Users Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Registered User Accounts ({users.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              List of all users registered in MySQL <code style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px' }}>users</code> table.
            </p>
          </div>
          <button onClick={fetchAdminData} className="btn btn-secondary btn-sm" title="Refresh user list">
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching registered users..." />
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No users found in database.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.92rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>User ID</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isAdminRole = u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        #{u.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {u.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: isAdminRole ? '#ede9fe' : 'var(--primary-light)',
                          color: isAdminRole ? '#6d28d9' : 'var(--primary)',
                          border: isAdminRole ? '1px solid #ddd6fe' : '1px solid #c7d2fe'
                        }}>
                          {isAdminRole ? '👑 ADMIN' : '👤 USER'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                        {formatDate(u.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
