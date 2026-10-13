import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, getDaysRemaining } from '../utils/dateUtils';

/**
 * ReminderDetailModal Component
 * Modal dialog displaying detailed information for a single reminder.
 */
export default function ReminderDetailModal({
  reminder,
  onClose,
  onComplete,
  onDelete
}) {
  if (!reminder) return null;

  const daysRemaining = getDaysRemaining(reminder.expiryDate);

  const getDaysRemainingBadge = () => {
    if (reminder.status === 'COMPLETED') {
      return <span style={{ color: 'var(--success)', fontWeight: 600 }}>Task is completed</span>;
    }
    if (daysRemaining === null) return null;
    if (daysRemaining < 0) {
      return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Expired {Math.abs(daysRemaining)} days ago</span>;
    }
    if (daysRemaining === 0) {
      return <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Expires today!</span>;
    }
    return (
      <span style={{ color: daysRemaining <= 7 ? 'var(--warning)' : 'var(--text-main)', fontWeight: 600 }}>
        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
      </span>
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="reminder-category" style={{ marginBottom: '6px' }}>
              {reminder.category}
            </span>
            <h2 className="modal-title">{reminder.title}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Status & Deadline Alert */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-main)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Current Status</div>
              <StatusBadge status={reminder.status} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Timeline</div>
              {getDaysRemainingBadge()}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
              Description & Notes
            </h4>
            <div style={{
              background: 'var(--bg-main)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {reminder.description || 'No description or notes provided for this reminder.'}
            </div>
          </div>

          {/* Detailed Timeline Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                📅 Expiration Date
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatDate(reminder.expiryDate)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '2px' }}>
                Raw: {reminder.expiryDate}
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                🔔 Alert Trigger Date
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
                {formatDate(reminder.reminderDate)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                ({reminder.reminderDays} days before expiry)
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(reminder.createdAt || reminder.updatedAt) && (
            <div style={{
              display: 'flex',
              gap: '24px',
              fontSize: '0.8rem',
              color: 'var(--text-light)',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-color)'
            }}>
              {reminder.createdAt && <div>Created: {new Date(reminder.createdAt).toLocaleString()}</div>}
              {reminder.updatedAt && <div>Updated: {new Date(reminder.updatedAt).toLocaleString()}</div>}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {reminder.status !== 'COMPLETED' && onComplete && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => {
                  onComplete(reminder.id);
                  onClose();
                }}
              >
                ✓ Mark Completed
              </button>
            )}

            <Link
              to={`/reminders/edit/${reminder.id}`}
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              ✎ Edit
            </Link>

            {onDelete && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  onDelete(reminder.id);
                  onClose();
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
