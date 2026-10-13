import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import NextUpcomingCard from '../components/NextUpcomingCard';
import ReminderCard from '../components/ReminderCard';
import ReminderDetailModal from '../components/ReminderDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getAllRemindersUnpaged, markAsCompleted, deleteReminder } from '../services/reminderService';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';

/**
 * Dashboard Page
 * Comprehensive overview featuring:
 * 1. 5 Metric stat cards (Total, Upcoming, Due Soon, Expired, Completed)
 * 2. Next upcoming reminder spotlight
 * 3. Important / Urgent reminders (Due Soon & Expired)
 * 4. Recently added reminders
 * 5. Category shortcuts
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReminder, setSelectedReminder] = useState(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllRemindersUnpaged();
      setReminders(Array.isArray(data) ? data : (data.content || []));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleComplete = async (id) => {
    try {
      const updated = await markAsCompleted(id);
      setReminders(prev => prev.map(r => (r.id === id ? updated : r)));
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark reminder as completed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete reminder.');
    }
  };

  // Calculated statistics
  const stats = {
    total: reminders.length,
    upcoming: reminders.filter(r => r.status === 'UPCOMING').length,
    dueSoon: reminders.filter(r => r.status === 'DUE_SOON').length,
    expired: reminders.filter(r => r.status === 'EXPIRED').length,
    completed: reminders.filter(r => r.status === 'COMPLETED').length,
  };

  // 1. Next Upcoming Reminder (closest pending deadline)
  const pendingReminders = reminders
    .filter(r => r.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const nextUpcoming = pendingReminders.length > 0 ? pendingReminders[0] : null;

  // 2. Important / Urgent Reminders (Due Soon & Expired needing action)
  const importantReminders = reminders.filter(
    r => (r.status === 'DUE_SOON' || r.status === 'EXPIRED') && r.status !== 'COMPLETED'
  );

  // 3. Recently Created Reminders (top 4, newest first)
  const recentReminders = [...reminders]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 4);

  // Category counts
  const categoryCounts = CATEGORIES.map(cat => ({
    name: cat,
    count: reminders.filter(r => r.category === cat).length
  }));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name || 'User'}! Track your document deadlines and renewals.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/reminders" className="btn btn-secondary">
            📋 View All ({stats.total})
          </Link>
          <Link to="/reminders/new" className="btn btn-primary">
            ➕ New Reminder
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger">
          <span>⚠️ {error}</span>
          <button onClick={fetchReminders} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      )}

      {/* 5 Metric Summary Stat Cards */}
      <div className="stats-grid-5">
        <StatCard
          label="Total Reminders"
          value={stats.total}
          icon="📋"
          variant="primary"
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          icon="📅"
          variant="info"
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          label="Due Soon"
          value={stats.dueSoon}
          icon="⚠️"
          variant="warning"
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon="⛔"
          variant="danger"
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon="✅"
          variant="success"
          onClick={() => navigate('/reminders')}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your reminder dashboard..." />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Welcome to Smart Reminder!"
          message="You haven't added any reminders yet. Create your first document expiration reminder to start tracking deadlines automatically."
          actionText="➕ Create Your First Reminder"
          actionLink="/reminders/new"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Section 1: Next Upcoming Reminder Spotlight */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
              🎯 Next Deadline in Focus
            </h2>
            <NextUpcomingCard
              reminder={nextUpcoming}
              onComplete={handleComplete}
              onView={(r) => setSelectedReminder(r)}
            />
          </div>

          {/* Section 2: Important & Urgent Reminders (Due Soon / Expired) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  🚨 Important & Urgent Reminders
                </h2>
                {importantReminders.length > 0 && (
                  <span style={{
                    background: 'var(--danger)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {importantReminders.length} NEED ACTION
                  </span>
                )}
              </div>
              {importantReminders.length > 0 && (
                <Link to="/reminders" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                  Manage All →
                </Link>
              )}
            </div>

            {importantReminders.length === 0 ? (
              <div className="card" style={{
                background: 'var(--bg-surface)',
                border: '1px dashed var(--border-color)',
                padding: '28px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>✨</div>
                <strong style={{ color: 'var(--text-main)' }}>No Urgent Items Right Now</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  None of your reminders are currently expired or due soon. Great job staying ahead!
                </p>
              </div>
            ) : (
              <div className="reminders-grid">
                {importantReminders.map(reminder => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onView={(r) => setSelectedReminder(r)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Recently Created Reminders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                🕒 Recently Added Reminders
              </h2>
              <Link to="/reminders" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                View All ({reminders.length}) →
              </Link>
            </div>

            <div className="reminders-grid">
              {recentReminders.map(reminder => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onView={(r) => setSelectedReminder(r)}
                />
              ))}
            </div>
          </div>

          {/* Section 4: Quick Category Breakdown */}
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
              📁 Categories Overview
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {categoryCounts.map(cat => (
                <div
                  key={cat.name}
                  className="card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => navigate('/reminders')}
                  title={`View ${cat.name} reminders`}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cat.count} reminder{cat.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal View */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
