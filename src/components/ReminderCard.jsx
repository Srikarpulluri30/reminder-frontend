import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/dateUtils';

/**
 * ReminderCard Component
 * Displays a summary card for an individual reminder with action triggers.
 */
export default function ReminderCard({ reminder, onComplete, onDelete, onView }) {
  return (
    <div className="reminder-card">
      <div>
        <div className="reminder-header">
          <span className="reminder-category">{reminder.category}</span>
          <StatusBadge status={reminder.status} />
        </div>

        <h3
          className="reminder-title"
          onClick={() => onView && onView(reminder)}
          style={{ cursor: onView ? 'pointer' : 'default' }}
          title={onView ? 'Click to view details' : ''}
        >
          {reminder.title}
        </h3>
        
        <p className="reminder-desc">
          {reminder.description
            ? (reminder.description.length > 95
                ? `${reminder.description.substring(0, 95)}...`
                : reminder.description)
            : 'No description provided.'}
        </p>
      </div>

      <div>
        <div className="reminder-meta">
          <div className="meta-item">
            <div className="meta-label">Expiry Date</div>
            <div className="meta-val">{formatDate(reminder.expiryDate)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Alert Date</div>
            <div className="meta-val">{formatDate(reminder.reminderDate)}</div>
          </div>
        </div>

        <div className="reminder-actions">
          {onView && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onView(reminder)}
              title="View full details"
            >
              👁 View
            </button>
          )}

          {reminder.status !== 'COMPLETED' && onComplete && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onComplete(reminder.id)}
              title="Mark as completed"
            >
              ✓ Done
            </button>
          )}

          <Link
            to={`/reminders/edit/${reminder.id}`}
            className="btn btn-secondary btn-sm"
            title="Edit reminder"
          >
            ✎ Edit
          </Link>

          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(reminder.id)}
              title="Delete reminder"
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
