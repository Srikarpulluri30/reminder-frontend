import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Register Page
 * 
 * Controlled registration form that creates a new user account,
 * automatically logs them in, and directs them to the Dashboard.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleGenerateSample = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: `User ${randomNum}`,
      email: `user${randomNum}@example.com`,
      password: 'password123',
      confirmPassword: 'password123',
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    // 1. Client-side Validation
    if (!cleanName || !cleanEmail || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage('Name must be at least 2 characters long.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Register will create the account AND automatically log in!
      await register(cleanName, cleanEmail, formData.password);

      // Direct to personal Dashboard immediately
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
      // Extract field validation or business error from backend
      if (err.response?.data?.validationErrors) {
        const firstError = Object.values(err.response.data.validationErrors)[0];
        setErrorMessage(firstError);
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Registration failed. Please make sure the backend is running on http://localhost:8080.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">🔔</div>
          <h2>Create Account</h2>
          <p>Start tracking document expirations & deadlines.</p>
        </div>

        {/* Quick Sample Generator Banner */}
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
              ⚡ Quick Fill Fresh Account
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Generate fresh unique email & password
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateSample}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Auto-Fill
          </button>
        </div>

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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Alice Smith"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
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
            <label className="form-label">Password * (Min. 6 characters)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              minLength="6"
              value={formData.confirmPassword}
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
            {isSubmitting ? 'Creating account & signing in...' : 'Register & Get Started'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
