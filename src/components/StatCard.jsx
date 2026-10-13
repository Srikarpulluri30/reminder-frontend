import React from 'react';

/**
 * StatCard Component
 * Displays summary metric counters on the dashboard.
 */
export default function StatCard({
  label,
  value,
  icon,
  variant = 'primary',
  onClick = null,
  isActive = false
}) {
  return (
    <div
      className={`stat-card ${isActive ? 'stat-card-active' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        border: isActive ? '2px solid var(--primary)' : undefined,
        background: isActive ? 'var(--primary-light)' : undefined,
      }}
    >
      <div className={`stat-icon ${variant}`}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
