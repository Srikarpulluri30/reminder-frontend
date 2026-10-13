import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/constants';
import { getReminderById, updateReminder } from '../services/reminderService';
import { formatDate } from '../utils/dateUtils';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Edit Reminder Page
 * Pre-populates existing reminder data, recalculates alert date live,
 * and handles field validations, 404s, and server errors.
 */
export default function EditReminderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'PASSPORT',
    expiryDate: '',
    reminderDays: 15,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [is404, setIs404] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing reminder on mount
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        setLoading(true);
        setGeneralError('');
        setIs404(false);
        const data = await getReminderById(id);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'OTHER',
          expiryDate: data.expiryDate || '',
          reminderDays: data.reminderDays !== undefined ? data.reminderDays : 15,
        });
      } catch (err) {
        console.error('Failed to load reminder details:', err);
        const status = err.response?.status;
        if (status === 404) {
          setIs404(true);
          setGeneralError('Reminder not found. It may have been deleted or belongs to another user account.');
        } else {
          setGeneralError(err.response?.data?.message || 'Could not load reminder details from the server.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [id]);

  // Live calculation of alert date
  const calculateAlertDate = (expiry, days) => {
    if (!expiry || days === '' || isNaN(days) || Number(days) < 0) return null;
    try {
      const d = new Date(expiry);
      d.setDate(d.getDate() - parseInt(days, 10));
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  const calculatedAlertDate = calculateAlertDate(formData.expiryDate, formData.reminderDays);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required.';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters long.';
    }

    if (!formData.category) {
      errors.category = 'Category is required.';
    }

    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiration date is required.';
    }

    if (formData.reminderDays === '' || isNaN(formData.reminderDays) || Number(formData.reminderDays) < 0) {
      errors.reminderDays = 'Reminder days must be 0 or greater.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await updateReminder(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        expiryDate: formData.expiryDate,
        reminderDays: parseInt(formData.reminderDays, 10)
      });
      navigate('/reminders');
    } catch (err) {
      console.error('Failed to update reminder:', err);
      const resData = err.response?.data;
      if (resData?.validationErrors) {
        setFieldErrors(resData.validationErrors);
        setGeneralError(resData.message || 'Please fix the highlighted validation errors.');
      } else {
        setGeneralError(resData?.message || 'Failed to update reminder. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading reminder details..." />;
  }

  if (is404) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Reminder Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            We could not locate reminder #{id}. It may have been deleted or belongs to a different account.
          </p>
          <Link to="/reminders" className="btn btn-primary">
            ← Back to All Reminders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Reminder #{id}</h1>
          <p className="page-subtitle">Update renewal deadlines or notification parameters.</p>
        </div>
        <Link to="/reminders" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      {/* Error Alert */}
      {generalError && (
        <div className="alert alert-danger">
          <span>⚠️ {generalError}</span>
          <Link to="/reminders" className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Back to Reminders
          </Link>
        </div>
      )}

      {/* Form Card */}
      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Reminder Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: fieldErrors.title ? 'var(--danger)' : undefined }}
            />
            {fieldErrors.title && (
              <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                {fieldErrors.title}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              disabled={submitting}
              style={{ borderColor: fieldErrors.category ? 'var(--danger)' : undefined }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.category && (
              <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                {fieldErrors.category}
              </div>
            )}
          </div>

          {/* Expiry Date & Days Before */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Expiration Date *</label>
              <input
                type="date"
                name="expiryDate"
                className="form-control"
                value={formData.expiryDate}
                onChange={handleChange}
                disabled={submitting}
                style={{ borderColor: fieldErrors.expiryDate ? 'var(--danger)' : undefined }}
              />
              {fieldErrors.expiryDate && (
                <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  {fieldErrors.expiryDate}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Alert Days Before Expiry *</label>
              <input
                type="number"
                name="reminderDays"
                className="form-control"
                min="0"
                max="365"
                value={formData.reminderDays}
                onChange={handleChange}
                disabled={submitting}
                style={{ borderColor: fieldErrors.reminderDays ? 'var(--danger)' : undefined }}
              />
              {fieldErrors.reminderDays && (
                <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  {fieldErrors.reminderDays}
                </div>
              )}
            </div>
          </div>

          {/* Smart Calculated Alert Date Preview */}
          {calculatedAlertDate && (
            <div style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <span style={{ fontSize: '1.6rem' }}>💡</span>
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                  Recalculated Alert Trigger:
                </strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '3px' }}>
                  Alert will trigger on <strong>{formatDate(calculatedAlertDate)}</strong> ({calculatedAlertDate}), exactly <strong>{formData.reminderDays} days</strong> prior to expiry ({formatDate(formData.expiryDate)}).
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description / Notes (Optional)</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <Link to="/reminders" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '💾 Updating...' : '💾 Update Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
