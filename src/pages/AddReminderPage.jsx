import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/constants';
import { createReminder } from '../services/reminderService';
import { formatDate } from '../utils/dateUtils';

/**
 * Add Reminder Page
 * Form to create a new reminder with client & server validation and live date preview.
 */
export default function AddReminderPage() {
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
  const [submitting, setSubmitting] = useState(false);

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
    
    // Clear specific field error as user types
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
      await createReminder({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        expiryDate: formData.expiryDate,
        reminderDays: parseInt(formData.reminderDays, 10)
      });
      navigate('/reminders');
    } catch (err) {
      console.error('Failed to create reminder:', err);
      const resData = err.response?.data;
      if (resData?.validationErrors) {
        setFieldErrors(resData.validationErrors);
        setGeneralError(resData.message || 'Please fix the highlighted form errors.');
      } else {
        setGeneralError(resData?.message || 'Failed to create reminder. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Reminder</h1>
          <p className="page-subtitle">Set up a smart document expiration reminder with automated date calculation.</p>
        </div>
        <Link to="/reminders" className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      {/* Error Alert */}
      {generalError && (
        <div className="alert alert-danger">
          <span>⚠️ {generalError}</span>
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
              className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Passport Expiry, Car Insurance Renewal, AWS Subscription"
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
              {fieldErrors.expiryDate ? (
                <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  {fieldErrors.expiryDate}
                </div>
              ) : (
                <div className="form-hint">The exact date when document expires.</div>
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
              {fieldErrors.reminderDays ? (
                <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: '4px', fontWeight: 500 }}>
                  {fieldErrors.reminderDays}
                </div>
              ) : (
                <div className="form-hint">How many days prior to trigger alert.</div>
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
                  Smart Calculated Alert Date:
                </strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '3px' }}>
                  You will be notified on <strong>{formatDate(calculatedAlertDate)}</strong> ({calculatedAlertDate}), exactly <strong>{formData.reminderDays} days</strong> prior to expiry ({formatDate(formData.expiryDate)}).
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
              placeholder="Add policy number, renewal portal link, or specific instructions..."
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <Link to="/reminders" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '💾 Saving Reminder...' : '💾 Save Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
