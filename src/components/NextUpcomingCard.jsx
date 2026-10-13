import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, getDaysRemaining } from '../utils/dateUtils';

/**
 * NextUpcomingCard Component
 * Highlights the closest upcoming reminder needing user attention.
 */
export default function NextUpcomingCard({ reminder, onComplete, onView }) {
  if (!reminder) {
    return (
      <div className="card" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1px solid #bbf7d0',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-md)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            🎉
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#166534', marginBottom: '2px' }}>
              All Caught Up!
            </h3>
            <p style={{ color: '#15803d', fontSize: '0.9rem' }}>
              You have no pending deadlines or upcoming expiration alerts right now.
            </p>
          </div>
        </div>
        <Link to="/reminders/new" className="btn btn-primary btn-sm">
          ➕ Add a Reminder
        </Link>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(reminder.expiryDate);

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)',
      border: '1px solid #fecaca',
      padding: '24px',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.5px'
          }}>
            ⚡ NEXT UPCOMING DEADLINE
          </span>
          <span className="reminder-category" style={{ marginBottom: 0 }}>
            {reminder.category}
          </span>
        </div>
        <StatusBadge status={reminder.status} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            {reminder.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '14px', lineHeight: 1.5 }}>
            {reminder.description || 'No description provided.'}
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Expiry Date: </span>
              <strong style={{ color: 'var(--text-main)' }}>{formatDate(reminder.expiryDate)}</strong>
              {daysRemaining !== null && (
                <span style={{
                  marginLeft: '8px',
                  fontWeight: 700,
                  color: daysRemaining <= 7 ? 'var(--danger)' : 'var(--primary)'
                }}>
                  ({daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days left`})
                </span>
              )}
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Alert Date: </span>
              <strong style={{ color: 'var(--primary)' }}>{formatDate(reminder.reminderDate)}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {onView && (
            <button className="btn btn-secondary btn-sm" onClick={() => onView(reminder)}>
              👁 View Details
            </button>
          )}
          {reminder.status !== 'COMPLETED' && onComplete && (
            <button className="btn btn-success btn-sm" onClick={() => onComplete(reminder.id)}>
              ✓ Mark Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
