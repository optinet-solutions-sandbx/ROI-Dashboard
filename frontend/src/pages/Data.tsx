import React, { useState } from 'react';
import type { PerformanceRecord } from '../utils/kpiEngine';

const PAGE_SIZE = 50;

const formatHeader = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export const Data: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const [page, setPage] = useState(0);

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>No data to display</h2>
        <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center' }}>
          Upload an Excel file from the sidebar to view raw records here.
        </p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, data.length);
  const rows = data.slice(start, end);

  return (
    <div>
      <div className="header">
        <h1>Data</h1>
        <p>Raw records from uploaded file</p>
      </div>

      <div style={{ marginBottom: '12px', color: '#94a3b8', fontSize: '0.875rem' }}>
        Showing {(start + 1).toLocaleString()}–{end.toLocaleString()} of {data.length.toLocaleString()} rows
      </div>

      <div className="data-table-container" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} style={{ whiteSpace: 'nowrap' }}>{formatHeader(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={start + idx}
                style={idx % 2 !== 0 ? { backgroundColor: 'rgba(255,255,255,0.03)' } : undefined}
              >
                {columns.map(col => (
                  <td key={col} style={{ whiteSpace: 'nowrap' }}>
                    {row[col] != null ? String(row[col]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
        <button
          className="uploader-btn"
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          style={{ opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
        >
          ← Prev
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Page {page + 1} of {totalPages}
        </span>
        <button
          className="uploader-btn"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          style={{ opacity: page >= totalPages - 1 ? 0.4 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
