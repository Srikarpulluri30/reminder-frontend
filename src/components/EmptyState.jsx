import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState Component
 * Displays a friendly placeholder when no data is found or created.
 */
export default function EmptyState({
  icon = '📋',
  title = 'No Reminders Found',
  message = 'You have not added any reminders yet, or no items match your search filters.',
  actionText = '➕ Add First Reminder',
  actionLink = '/reminders/new',
  onActionClick = null,
}) {
  return (
    <div className="empty-state card">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-text">{message}</p>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary" style={{ marginTop: '16px' }}>
          {actionText}
        </Link>
      )}
      {!actionLink && onActionClick && (
        <button onClick={onActionClick} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
