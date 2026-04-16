import React, { useState, useEffect } from 'react';
import type { PerformanceRecord } from '../utils/kpiEngine';

const PAGE_SIZE = 20;

const formatHeader = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #1e293b',
  backgroundColor: '#0d1628',
  color: '#e9eef5',
  fontSize: '0.875rem',
  outline: 'none',
  minWidth: '180px',
  flex: 1,
};

export const Data: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => { setPage(0); }, [data, search]);

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

  const filteredData = data.filter(row => {
    if (!search) return true;
    const q        = search.toLowerCase();
    const affId    = String(row.affiliate_id ?? row.affiliate ?? '').toLowerCase();
    const country  = String(row.country ?? '').toLowerCase();
    const campaign = String(row.campaign ?? row.brand ?? '').toLowerCase();
    return affId.includes(q) || country.includes(q) || campaign.includes(q);
  });

  const columns   = Object.keys(data[0]);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const start      = safePage * PAGE_SIZE;
  const end        = Math.min(start + PAGE_SIZE, filteredData.length);
  const rows       = filteredData.slice(start, end);

  return (
    <div>
      <div className="header">
        <h1>Data</h1>
        <p>Raw records from uploaded file</p>
      </div>

      {/* Search input */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search Affiliate ID, Country or Campaign…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '420px' }}
        />
      </div>

      <div style={{ marginBottom: '12px', color: '#94a3b8', fontSize: '0.875rem' }}>
        Showing {filteredData.length === 0 ? 0 : (start + 1).toLocaleString()}–{end.toLocaleString()} of {filteredData.length.toLocaleString()} rows
        {filteredData.length !== data.length && ` (filtered from ${data.length.toLocaleString()})`}
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
        <button
          className="uploader-btn"
          onClick={() => setPage(p => p - 1)}
          disabled={safePage === 0}
          aria-label="Previous page"
          style={{ opacity: safePage === 0 ? 0.4 : 1, cursor: safePage === 0 ? 'not-allowed' : 'pointer' }}
        >
          ← Prev
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          className="uploader-btn"
          onClick={() => setPage(p => p + 1)}
          disabled={safePage >= totalPages - 1}
          aria-label="Next page"
          style={{ opacity: safePage >= totalPages - 1 ? 0.4 : 1, cursor: safePage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
