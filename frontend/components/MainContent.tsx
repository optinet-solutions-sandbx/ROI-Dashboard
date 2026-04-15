'use client';

import { useState, type ReactNode } from 'react';
import { useData } from './DataProvider';

export function MainContent({ children }: { children: ReactNode }) {
  const { data, loading, upload }     = useData();
  const [isDraggingOver, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Please drop an Excel file (.xlsx, .xls, or .csv)');
      return;
    }
    upload(file);
  };

  return (
    <main
      className="flex-1 p-8 overflow-y-auto relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-[#0f172a]/85 flex items-center justify-center z-50 rounded-lg">
          <div className="border-2 border-dashed border-purple-700 rounded-xl px-16 py-12 text-center">
            <p className="text-[#e2e8f0] text-xl font-semibold">Drop your Excel file here</p>
          </div>
        </div>
      )}

      {loading && (
        <p className="text-[#94a3b8]">Processing Dataset...</p>
      )}

      {!loading && data.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-4xl font-bold mb-4">Ready to analyze</h2>
          <p className="text-[#94a3b8] max-w-sm text-center">
            Upload your affiliate performance data via the sidebar to generate instant KPI dashboards and insights.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="animate-[fadeIn_0.3s_ease-in]">
          {children}
        </div>
      )}
    </main>
  );
}
