import React from 'react';

/**
 * Pagination Component
 * 
 * Clean, reusable pagination bar with page numbers, prev/next buttons,
 * page size selector, and result count summaries.
 */
export default function Pagination({
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalElements === 0 || totalPages <= 1 && totalElements <= pageSize) {
    return null;
  }

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages - 1, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(0, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      marginTop: '28px',
      padding: '16px 20px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Result Count Summary */}
      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalElements}</strong> reminders
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Previous Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Previous page"
        >
          ← Prev
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-secondary'}`}
            style={{ minWidth: '36px' }}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* Next Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Next page"
        >
          Next →
        </button>
      </div>

      {/* Items Per Page Selector */}
      {onPageSizeChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Per page:</span>
          <select
            className="form-control"
            style={{ padding: '4px 10px', width: 'auto', fontSize: '0.85rem' }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>
      )}
    </div>
  );
}
