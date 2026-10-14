import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login Page
 * 
 * Controlled form that authenticates credentials with the Spring Boot backend
 * and redirects upon successful JWT receipt.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Controlled form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success message if passed from registration redirect
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleFillDemo = () => {
    setFormData({ email: 'john.doe@example.com', password: 'password123' });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData.email.trim(), formData.password);

      // Redirect to the intended page or default to dashboard
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message || 'Login failed. Please check your credentials or ensure the backend server is running.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">🔔</div>
          <h2>Sign In</h2>
          <p>Access your personal document and task reminders.</p>
        </div>

        {/* Quick Demo Fill Banner */}
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid #c7d2fe',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
              ⚡ Quick Demo User
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              john.doe@example.com / password123
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Auto-Fill
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            background: 'var(--success-light)',
            color: '#065f46',
            border: '1px solid var(--success-border)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: 'var(--danger-light)',
            color: '#991b1b',
            border: '1px solid var(--danger-border)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
