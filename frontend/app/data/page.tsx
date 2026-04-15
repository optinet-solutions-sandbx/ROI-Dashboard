'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/components/DataProvider';

const PAGE_SIZE = 50;

const formatHeader = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function DataPage() {
  const { data } = useData();
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h2 className="text-4xl font-bold mb-4">No data to display</h2>
        <p className="text-[#94a3b8] max-w-sm text-center">
          Upload an Excel file from the sidebar to view raw records here.
        </p>
      </div>
    );
  }

  const columns    = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const start      = page * PAGE_SIZE;
  const end        = Math.min(start + PAGE_SIZE, data.length);
  const rows       = data.slice(start, end);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Data</h1>
        <p className="text-[#94a3b8]">Raw records from uploaded file</p>
      </div>

      <p className="mb-3 text-[#94a3b8] text-sm">
        Showing {(start + 1).toLocaleString()}–{end.toLocaleString()} of {data.length.toLocaleString()} rows
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#1e293b] bg-[#0d1427]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-4 py-3 bg-[#0a0f1e]/90 text-[#94a3b8] text-xs uppercase font-semibold border-b border-[#1e293b] whitespace-nowrap"
                >
                  {formatHeader(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={start + idx}
                className={idx % 2 !== 0 ? 'bg-white/[0.03]' : undefined}
              >
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 border-b border-[#1e293b] whitespace-nowrap">
                    {row[col] != null ? String(row[col]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 items-center mt-4">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          aria-label="Previous page"
          className="bg-gradient-to-r from-sky-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="text-[#94a3b8] text-sm">Page {page + 1} of {totalPages}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          className="bg-gradient-to-r from-sky-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
