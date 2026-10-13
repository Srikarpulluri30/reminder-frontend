import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar Component
 * Main navigation bar for the individual Smart Reminder application.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🔔</div>
        <span>Smart Reminder</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/reminders"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span>📋</span>
          <span>All Reminders</span>
        </NavLink>

        <NavLink
          to="/reminders/new"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span>➕</span>
          <span>Add Reminder</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span>👤</span>
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div>Smart Reminder v1.0</div>
        <small style={{ opacity: 0.7 }}>Personal Reminder Tracker</small>
      </div>
    </aside>
  );
}
