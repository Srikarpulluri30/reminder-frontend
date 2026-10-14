import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl, testApiHealth } from '../services/api';

/**
 * Login Page
 * 
 * Controlled form that authenticates credentials with the Spring Boot backend
 * and redirects upon successful JWT receipt.
 * Includes automated cloud backend connectivity detection and configuration helper.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Controlled form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend connection state
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const initialBaseUrl = getApiBaseUrl();
  const isTargetingLocalhost = initialBaseUrl.includes('localhost') || initialBaseUrl.includes('127.0.0.1');

  const [serverUrlInput, setServerUrlInput] = useState(
    initialBaseUrl.includes('localhost') ? '' : initialBaseUrl.replace(/\/api\/?$/, '')
  );
  const [currentApiUrl, setCurrentApiUrl] = useState(initialBaseUrl);
  const [showServerConfig, setShowServerConfig] = useState(isHttps && isTargetingLocalhost);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionSuccessMsg, setConnectionSuccessMsg] = useState('');
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');

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

  const handleConnectServer = async (e) => {
    e?.preventDefault();
    setConnectionErrorMsg('');
    setConnectionSuccessMsg('');

    if (!serverUrlInput.trim()) {
      setConnectionErrorMsg('Please enter your Render backend URL (e.g. https://your-backend.onrender.com)');
      return;
    }

    try {
      setTestingConnection(true);
      await testApiHealth(serverUrlInput.trim());
      setApiBaseUrl(serverUrlInput.trim());
      const updated = getApiBaseUrl();
      setCurrentApiUrl(updated);
      setConnectionSuccessMsg(`Successfully connected to ${updated}! You can now sign in.`);
      setErrorMessage('');
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionErrorMsg(
        'Could not reach the backend at this URL. Please verify the URL, ensure your Render Web Service is running, and try again.'
      );
    } finally {
      setTestingConnection(false);
    }
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
      if (!err.response) {
        // Network failure / Mixed content / Backend offline
        setShowServerConfig(true);
        setErrorMessage(
          `Cannot reach backend at ${getApiBaseUrl()}. Please verify your backend server URL below.`
        );
      } else {
        const serverMsg = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
        setErrorMessage(serverMsg);
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
          <h2>Sign In</h2>
          <p>Access your personal document and task reminders.</p>
        </div>

        {/* Server Connection Banner (When hosted on HTTPS/Vercel or if user wants to change backend) */}
        {(isHttps && isTargetingLocalhost || showServerConfig) && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '20px',
            fontSize: '0.86rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚙️</span> Backend Server Connection
              </strong>
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                {showServerConfig ? 'Hide' : 'Configure'}
              </button>
            </div>

            <p style={{ color: '#78350f', margin: '0 0 10px 0', lineHeight: 1.4, fontSize: '0.8rem' }}>
              {isTargetingLocalhost
                ? 'Your frontend is deployed on Vercel (HTTPS), but is currently pointing to local development (localhost:8080). Paste your Render backend URL below to connect.'
                : `Currently connecting to: ${currentApiUrl}`}
            </p>

            <form onSubmit={handleConnectServer} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="url"
                placeholder="https://your-backend.onrender.com"
                value={serverUrlInput}
                onChange={(e) => setServerUrlInput(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={testingConnection}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {testingConnection ? 'Testing...' : 'Connect'}
              </button>
            </form>

            {connectionSuccessMsg && (
              <div style={{ color: '#166534', marginTop: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                ✓ {connectionSuccessMsg}
              </div>
            )}
            {connectionErrorMsg && (
              <div style={{ color: '#991b1b', marginTop: '8px', fontSize: '0.8rem', fontWeight: 500 }}>
                ⚠️ {connectionErrorMsg}
              </div>
            )}
          </div>
        )}

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

        <div className="auth-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Don't have an account? <Link to="/register">Create one</Link></span>
          {!showServerConfig && (
            <button
              type="button"
              onClick={() => setShowServerConfig(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              ⚙️ Server URL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
