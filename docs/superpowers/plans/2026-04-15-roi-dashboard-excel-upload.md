# ROI Dashboard — Excel Upload & Data Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the dashboard title, map the real Excel columns to kpiEngine fields, add a drag-and-drop overlay on the main content area, and add a paginated raw Data tab.

**Architecture:** Four targeted edits to existing files plus one new page component. The column alias map lives in `excelParser.ts` so all downstream pages (Overview, Affiliates, Campaigns, Insights, Data) receive correctly-named fields automatically. The drag overlay is a React state flag on `<main>` — no new component needed. The Data page is a standalone component that reuses existing CSS classes.

**Tech Stack:** React 19, TypeScript 6, Vite 8, lucide-react, xlsx

---

## File Map

| File | Change |
|---|---|
| `frontend/src/components/Sidebar.tsx` | Fix title text; add Data nav tab + Table icon import |
| `frontend/src/utils/excelParser.ts` | Add `COLUMN_ALIASES` map applied after normalization |
| `frontend/src/App.tsx` | Add `isDraggingOver` state + drag handlers on `<main>`; import + render `<Data>` |
| `frontend/src/pages/Data.tsx` | **New** — paginated raw data table, 50 rows/page |

---

## Task 1: Fix Dashboard Title

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx:33`

- [ ] **Step 1: Edit the title text**

In `frontend/src/components/Sidebar.tsx`, change line 33 from:
```tsx
      <h2>📊 RIO Dashboard</h2>
```
to:
```tsx
      <h2>📊 ROI Dashboard</h2>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "fix: rename RIO Dashboard to ROI Dashboard"
```

---

## Task 2: Fix Excel Column Mapping

**Files:**
- Modify: `frontend/src/utils/excelParser.ts`

- [ ] **Step 1: Add the alias map and apply it**

Replace the entire contents of `frontend/src/utils/excelParser.ts` with:

```ts
import * as XLSX from 'xlsx';

const COLUMN_ALIASES: Record<string, string> = {
  partner_id: 'affiliate_id',
  player_country: 'country',
  campaign_name: 'campaign',
  stats_date: 'date',
  ftd_count: 'ftds',
  deposits_sum: 'revenue',
  partner_income: 'cost',
};

export const normalizeColumnName = (name: string): string => {
  return name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
};

export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        let allData: any[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const rawJSON = XLSX.utils.sheet_to_json(sheet) as any[];

          const normalizedJSON = rawJSON.map(row => {
            const newRow: Record<string, any> = {};
            for (const key in row) {
              const normKey = normalizeColumnName(key);
              const aliasedKey = COLUMN_ALIASES[normKey] ?? normKey;
              newRow[aliasedKey] = row[key];
            }
            return newRow;
          });

          allData = [...allData, ...normalizedJSON];
        });

        resolve(allData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/utils/excelParser.ts
git commit -m "fix: map Excel column names to kpiEngine fields via alias table"
```

---

## Task 3: Add Drag-and-Drop Overlay to Main Content

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Replace App.tsx with the version that includes the drag overlay**

Replace the entire contents of `frontend/src/App.tsx` with:

```tsx
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { parseExcelFile } from './utils/excelParser';
import type { PerformanceRecord } from './utils/kpiEngine';
import { Overview } from './pages/Overview';
import { Affiliates } from './pages/Affiliates';
import { Campaigns } from './pages/Campaigns';
import { Insights } from './pages/Insights';

function App() {
  const [data, setData] = useState<PerformanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
    } catch (error) {
      console.error('Error parsing excel:', error);
      alert('Failed to parse Excel file. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onFileUpload={handleFileUpload} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main
        className="main-content"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ position: 'relative' }}
      >
        {isDraggingOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            borderRadius: '8px',
          }}>
            <div style={{
              border: '2px dashed #7c3aed',
              borderRadius: '12px',
              padding: '48px 64px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600 }}>
                Drop your Excel file here
              </p>
            </div>
          </div>
        )}
        {loading && <p>Processing Dataset...</p>}
        {!loading && data.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ready to analyze</h2>
            <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center' }}>
              Upload your affiliate performance data via the sidebar to generate instant KPI dashboards and insights.
            </p>
          </div>
        ) : !loading && data.length > 0 ? (
          <div className="fade-in">
            {activeTab === 'Overview' && <Overview data={data} />}
            {activeTab === 'Affiliates' && <Affiliates data={data} />}
            {activeTab === 'Campaigns' && <Campaigns data={data} />}
            {activeTab === 'Insights' && <Insights data={data} />}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
```

Note: The `Data` tab import and render are added in Task 5 after the Data component is created.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: add drag-and-drop overlay on main content area"
```

---

## Task 4: Create the Data Page Component

**Files:**
- Create: `frontend/src/pages/Data.tsx`

- [ ] **Step 1: Create the file**

Create `frontend/src/pages/Data.tsx` with this content:

```tsx
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
        <p style={{ color: '#94a3b8' }}>No data loaded.</p>
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
          style={{ opacity: page >= totalPages - 1 ? 0.4 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Data.tsx
git commit -m "feat: add paginated raw data table page"
```

---

## Task 5: Wire Up the Data Tab

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx` (add Table icon + Data tab)
- Modify: `frontend/src/App.tsx` (import Data + render conditionally)

- [ ] **Step 1: Update Sidebar.tsx**

Replace the entire contents of `frontend/src/components/Sidebar.tsx` with:

```tsx
import React from 'react';
import { UploadCloud, LayoutDashboard, Users, Megaphone, Lightbulb, Table } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'Overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'Affiliates', label: 'Affiliates', icon: <Users size={20} /> },
    { id: 'Campaigns', label: 'Campaigns', icon: <Megaphone size={20} /> },
    { id: 'Insights', label: 'Insights', icon: <Lightbulb size={20} /> },
    { id: 'Data', label: 'Data', icon: <Table size={20} /> },
  ];

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="sidebar">
      <h2>📊 ROI Dashboard</h2>

      <div
        className="uploader-box"
        style={{ padding: '20px', margin: '20px 0', border: '2px dashed #1e3a5f' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud size={32} color="#94a3b8" />
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '8px 0' }}>Drag Excel here</p>
        <label className="uploader-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-block' }}>
          Browse
          <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileChange} />
        </label>
      </div>

      <div className="sidebar-divider"></div>

      <div className="nav-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
```

- [ ] **Step 2: Update App.tsx to import and render the Data tab**

Replace the entire contents of `frontend/src/App.tsx` with:

```tsx
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { parseExcelFile } from './utils/excelParser';
import type { PerformanceRecord } from './utils/kpiEngine';
import { Overview } from './pages/Overview';
import { Affiliates } from './pages/Affiliates';
import { Campaigns } from './pages/Campaigns';
import { Insights } from './pages/Insights';
import { Data } from './pages/Data';

function App() {
  const [data, setData] = useState<PerformanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
    } catch (error) {
      console.error('Error parsing excel:', error);
      alert('Failed to parse Excel file. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onFileUpload={handleFileUpload} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main
        className="main-content"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ position: 'relative' }}
      >
        {isDraggingOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            borderRadius: '8px',
          }}>
            <div style={{
              border: '2px dashed #7c3aed',
              borderRadius: '12px',
              padding: '48px 64px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600 }}>
                Drop your Excel file here
              </p>
            </div>
          </div>
        )}
        {loading && <p>Processing Dataset...</p>}
        {!loading && data.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ready to analyze</h2>
            <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center' }}>
              Upload your affiliate performance data via the sidebar to generate instant KPI dashboards and insights.
            </p>
          </div>
        ) : !loading && data.length > 0 ? (
          <div className="fade-in">
            {activeTab === 'Overview' && <Overview data={data} />}
            {activeTab === 'Affiliates' && <Affiliates data={data} />}
            {activeTab === 'Campaigns' && <Campaigns data={data} />}
            {activeTab === 'Insights' && <Insights data={data} />}
            {activeTab === 'Data' && <Data data={data} />}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: Verify TypeScript compiles clean**

```bash
cd frontend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Run a full build to confirm no bundle errors**

```bash
cd frontend && npm run build
```
Expected: `✓ built in Xs` with no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Sidebar.tsx frontend/src/App.tsx
git commit -m "feat: add Data tab to sidebar and wire up Data page"
```

---

## Self-Review Checklist

| Spec requirement | Covered by |
|---|---|
| Title "ROI Dashboard" | Task 1 + Task 5 (both files updated consistently) |
| Column aliases: partner_id → affiliate_id, player_country → country, campaign_name → campaign, stats_date → date, ftd_count → ftds, deposits_sum → revenue, partner_income → cost | Task 2 |
| Drag overlay on main content | Task 3 + Task 5 |
| New Data nav tab | Task 5 (Sidebar) |
| Data page: header, row count indicator, 50-row pagination, horizontal scroll, zebra rows, Prev/Next | Task 4 |
| Data tab wired in App.tsx | Task 5 (App.tsx) |
