import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReminderCard from '../components/ReminderCard';
import ReminderDetailModal from '../components/ReminderDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { CATEGORIES, STATUSES } from '../utils/constants';
import { getReminders, markAsCompleted, deleteReminder } from '../services/reminderService';

/**
 * Reminders Page
 * 
 * Lists reminders with server-side pagination, sorting, live filtering,
 * search, and comprehensive error handling (401, 403, 404, 500).
 */
export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { status, message }
  
  // Query Filters & Search
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting: field and direction
  const [sortOption, setSortOption] = useState('expiryDate_asc');

  // Pagination metadata
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedReminder, setSelectedReminder] = useState(null);

  // Parse sortOption into sortBy and sortDir
  const [sortBy, sortDir] = sortOption.split('_');

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy || 'expiryDate',
        sortDir: sortDir || 'asc',
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      };

      const data = await getReminders(params);

      if (data && data.content !== undefined) {
        setReminders(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else if (Array.isArray(data)) {
        setReminders(data);
        setTotalPages(1);
        setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Failed to load reminders from the server.';

      if (status === 403) {
        setError({ status: 403, message: 'Access Denied: You do not have permission to view these reminders.' });
      } else if (status === 404) {
        setError({ status: 404, message: 'The requested reminders resource was not found on the server.' });
      } else if (status === 401) {
        setError({ status: 401, message: 'Your session has expired. Please log in again.' });
      } else {
        setError({ status: status || 500, message });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDir, selectedStatus, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Reset to page 0 whenever filters or sorting change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(0);
  };

  const handleComplete = async (id) => {
    try {
      const updated = await markAsCompleted(id);
      setReminders(prev => prev.map(r => (r.id === id ? updated : r)));
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark reminder as completed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this reminder?')) {
      return;
    }
    try {
      await deleteReminder(id);
      fetchReminders();
      if (selectedReminder && selectedReminder.id === id) {
        setSelectedReminder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete reminder.');
    }
  };

  const handleResetFilters = () => {
    setSelectedStatus('');
    setSelectedCategory('');
    setSearchTerm('');
    setSortOption('expiryDate_asc');
    setCurrentPage(0);
  };

  const isFiltered = Boolean(selectedStatus || selectedCategory || searchTerm);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Reminders</h1>
          <p className="page-subtitle">Search, filter, and organize all your document expiration tasks.</p>
        </div>
        <Link to="/reminders/new" className="btn btn-primary">
          ➕ New Reminder
        </Link>
      </div>

      {/* Error Alert with Status-Specific Context */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>HTTP {error.status}: </strong>
            <span>{error.message}</span>
          </div>
          <button onClick={fetchReminders} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '28px', padding: '18px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'center' }}>
          {/* Search Input */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Search Keyword</label>
            <input
              type="text"
              placeholder="Search title or notes..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Status</label>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Category</label>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Sort By</label>
            <select
              className="form-control"
              value={sortOption}
              onChange={(e) => handleFilterChange(setSortOption, e.target.value)}
            >
              <option value="expiryDate_asc">Expiry Date (Earliest first)</option>
              <option value="expiryDate_desc">Expiry Date (Latest first)</option>
              <option value="reminderDate_asc">Alert Date (Earliest first)</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="createdAt_desc">Recently Created</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        {isFiltered && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Filtered Results: <strong>{totalElements}</strong> items found
            </span>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ✕ Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main List Rendering */}
      {loading ? (
        <LoadingSpinner text="Loading reminders..." />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={isFiltered ? '🔍' : '📋'}
          title={isFiltered ? 'No Matching Reminders' : 'No Reminders Yet'}
          message={
            isFiltered
              ? 'No reminders match your current search query or filter selection.'
              : 'You have not added any reminders yet. Create your first expiration alert to get started!'
          }
          actionText={isFiltered ? 'Clear Filters' : '➕ Create Reminder'}
          actionLink={isFiltered ? undefined : '/reminders/new'}
          onActionClick={isFiltered ? handleResetFilters : undefined}
        />
      ) : (
        <>
          <div className="reminders-grid">
            {reminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onView={(r) => setSelectedReminder(r)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(0);
            }}
          />
        </>
      )}

      {/* Details Modal */}
      {selectedReminder && (
        <ReminderDetailModal
          reminder={selectedReminder}
          onClose={() => setSelectedReminder(null)}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
