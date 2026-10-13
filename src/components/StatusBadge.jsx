import React from 'react';

/**
 * StatusBadge Component
 * Displays a color-coded status badge for a reminder.
 */
export default function StatusBadge({ status }) {
  const normalizedStatus = (status || 'UPCOMING').toUpperCase();

  const getBadgeConfig = () => {
    switch (normalizedStatus) {
      case 'DUE_SOON':
        return { className: 'badge-due_soon', text: 'Due Soon', icon: '⚠️' };
      case 'EXPIRED':
        return { className: 'badge-expired', text: 'Expired', icon: '⛔' };
      case 'COMPLETED':
        return { className: 'badge-completed', text: 'Completed', icon: '✓' };
      case 'UPCOMING':
      default:
        return { className: 'badge-upcoming', text: 'Upcoming', icon: '📅' };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.className}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
}
