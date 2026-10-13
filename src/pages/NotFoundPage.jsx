import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found Page
 */
export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>404</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '12px 0' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Return to Dashboard
      </Link>
    </div>
  );
}
