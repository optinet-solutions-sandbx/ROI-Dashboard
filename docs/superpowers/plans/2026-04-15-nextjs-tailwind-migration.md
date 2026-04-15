# Next.js + Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing Vite/React frontend in `frontend/` to Next.js 15 (App Router) + Tailwind v4, with server-side Excel parsing via an API route, preserving all five dashboard pages and the existing visual design.

**Architecture:** URL-based routing with one route per page (`/overview`, `/affiliates`, etc.). React Context (`DataProvider`) holds uploaded data client-side. All page components are `"use client"` since they read from context and render interactive charts. A `MainContent` wrapper handles the empty/loading state globally. The `app/layout.tsx` is a Server Component that renders `DataProvider` + `Sidebar` + `MainContent`.

**Tech Stack:** Next.js 15, React 19, TypeScript 6, Tailwind CSS v4 (`@tailwindcss/postcss`), Recharts 3, Lucide React, xlsx (server-side), clsx + tailwind-merge, Vitest

---

## File Map

### Create
- `frontend/package.json` — replace Vite package.json with Next.js deps
- `frontend/next.config.ts` — minimal Next.js config
- `frontend/tsconfig.json` — replace Vite tsconfig with Next.js tsconfig
- `frontend/postcss.config.mjs` — Tailwind v4 PostCSS plugin
- `frontend/vitest.config.ts` — Vitest config for unit tests
- `frontend/app/globals.css` — Tailwind imports + `@theme` color tokens + keyframes
- `frontend/app/layout.tsx` — Server Component: root HTML, Inter font, DataProvider + Sidebar + MainContent
- `frontend/app/page.tsx` — Server Component: redirect to `/overview`
- `frontend/app/overview/page.tsx` — Overview dashboard page ("use client")
- `frontend/app/affiliates/page.tsx` — Affiliates table + scatter chart ("use client")
- `frontend/app/campaigns/page.tsx` — Campaigns bar chart ("use client")
- `frontend/app/insights/page.tsx` — Insights + recommendations ("use client")
- `frontend/app/data/page.tsx` — Paginated raw data table ("use client")
- `frontend/app/api/upload/route.ts` — POST handler: parse Excel buffer, return PerformanceRecord[]
- `frontend/components/DataProvider.tsx` — React Context: data, loading, upload()
- `frontend/components/KPICard.tsx` — Pure display card with Tailwind
- `frontend/components/Sidebar.tsx` — Nav with Link + file upload ("use client")
- `frontend/components/MainContent.tsx` — Drag-drop wrapper, empty/loading state ("use client")
- `frontend/components/charts/PerformanceChart.tsx` — Recharts AreaChart ("use client")
- `frontend/components/charts/CountryPieChart.tsx` — Recharts PieChart ("use client")
- `frontend/components/charts/AffiliatesBarChart.tsx` — Recharts BarChart ("use client")
- `frontend/utils/kpiEngine.ts` — Copied from `src/utils/kpiEngine.ts` (unchanged)
- `frontend/utils/excelParser.ts` — Server-side version using Buffer (not FileReader)
- `frontend/utils/cn.ts` — clsx + tailwind-merge helper
- `frontend/utils/kpiEngine.test.ts` — Vitest unit tests for processKPIs + getInsights
- `frontend/utils/excelParser.test.ts` — Vitest unit tests for normalizeColumnName

### Modify
- `vercel.json` — change `framework` to `nextjs`, remove `outputDirectory`

### Delete (after new files work)
- `frontend/src/` — entire old Vite source directory
- `frontend/vite.config.ts`
- `frontend/index.html`
- `frontend/tsconfig.app.json`
- `frontend/tsconfig.node.json`
- `frontend/eslint.config.js`

---

## Task 1: Replace package.json and create Next.js config files

**Files:**
- Replace: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tsconfig.json`

- [ ] **Step 1: Replace `frontend/package.json`**

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.19.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "lucide-react": "^1.8.0",
    "recharts": "^3.8.1",
    "xlsx": "^0.18.5",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.0",
    "tailwindcss": "^4.1.0",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "typescript": "~6.0.2",
    "vitest": "^3.0.0",
    "@vitejs/plugin-react": "^6.0.1"
  }
}
```

- [ ] **Step 2: Create `frontend/next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create `frontend/tsconfig.json`** (replaces the Vite tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Install dependencies**

```bash
cd frontend && npm install
```

Expected: installs Next.js, Tailwind v4, all dependencies. No errors.

- [ ] **Step 5: Commit**

```bash
cd frontend && git add package.json next.config.ts tsconfig.json
git commit -m "chore: scaffold Next.js 15 project config (replaces Vite)"
```

---

## Task 2: Configure Tailwind v4 and global CSS

**Files:**
- Create: `frontend/postcss.config.mjs`
- Create: `frontend/app/globals.css`

- [ ] **Step 1: Create `frontend/postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 2: Create `frontend/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg:         #0a0f1e;
  --color-bg-sidebar: #0d1427;
  --color-bg-card:    rgba(13, 20, 39, 0.7);
  --color-border:     #1e293b;
  --color-primary:    #00d4ff;
  --color-success:    #10b981;
  --color-warning:    #f59e0b;
  --color-danger:     #ef4444;
  --color-purple:     #7c3aed;
  --color-pink:       #ec4899;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;

  --animate-fade-in: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/postcss.config.mjs frontend/app/globals.css
git commit -m "feat: configure Tailwind v4 with custom color tokens"
```

---

## Task 3: Set up Vitest

**Files:**
- Create: `frontend/vitest.config.ts`

- [ ] **Step 1: Create `frontend/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add frontend/vitest.config.ts
git commit -m "chore: add Vitest config for unit tests"
```

---

## Task 4: Migrate utilities and write tests

**Files:**
- Create: `frontend/utils/kpiEngine.ts`
- Create: `frontend/utils/excelParser.ts`
- Create: `frontend/utils/cn.ts`
- Create: `frontend/utils/kpiEngine.test.ts`
- Create: `frontend/utils/excelParser.test.ts`

- [ ] **Step 1: Write failing tests for `kpiEngine.ts`**

Create `frontend/utils/kpiEngine.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { processKPIs, getInsights } from './kpiEngine';

describe('processKPIs', () => {
  it('sums revenue, cost, profit across rows', () => {
    const data = [
      { revenue: 1000, cost: 400, ftds: 10, clicks: 200, registrations: 50 },
      { revenue: 500,  cost: 200, ftds: 5,  clicks: 100, registrations: 25 },
    ];
    const result = processKPIs(data);
    expect(result.revenue).toBe(1500);
    expect(result.cost).toBe(600);
    expect(result.profit).toBe(900);
    expect(result.ftds).toBe(15);
  });

  it('calculates ROI as profit/cost', () => {
    const result = processKPIs([{ revenue: 1000, cost: 400 }]);
    expect(result.roi).toBeCloseTo(1.5);
  });

  it('returns roi=0 when cost is 0', () => {
    const result = processKPIs([{ revenue: 100, cost: 0 }]);
    expect(result.roi).toBe(0);
  });

  it('calculates cpa as cost/ftds', () => {
    const result = processKPIs([{ revenue: 500, cost: 300, ftds: 10 }]);
    expect(result.cpa).toBe(30);
  });

  it('calculates conversion_rate as ftds/clicks', () => {
    const result = processKPIs([{ clicks: 200, ftds: 10 }]);
    expect(result.conversion_rate).toBeCloseTo(0.05);
  });
});

describe('getInsights', () => {
  it('ranks top affiliates by profit descending', () => {
    const data = [
      { affiliate_id: 'A1', revenue: 1000, cost: 200 },
      { affiliate_id: 'A2', revenue: 300,  cost: 100 },
      { affiliate_id: 'A1', revenue: 500,  cost: 100 },
    ];
    const { top_affiliates } = getInsights(data);
    expect(top_affiliates[0]).toBe('A1'); // A1 profit=1200, A2 profit=200
  });

  it('identifies worst affiliates with negative ROI', () => {
    const data = [
      { affiliate_id: 'loser', revenue: 100, cost: 500 },
      { affiliate_id: 'winner', revenue: 500, cost: 100 },
    ];
    const { worst_affiliates } = getInsights(data);
    expect(worst_affiliates).toContain('loser');
    expect(worst_affiliates).not.toContain('winner');
  });

  it('returns empty worst_affiliates when all ROIs are positive', () => {
    const data = [{ affiliate_id: 'good', revenue: 500, cost: 100 }];
    const { worst_affiliates } = getInsights(data);
    expect(worst_affiliates).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests — confirm they FAIL (kpiEngine.ts doesn't exist yet)**

```bash
cd frontend && npm test
```

Expected: FAIL — `Cannot find module './kpiEngine'`

- [ ] **Step 3: Write failing tests for `normalizeColumnName`**

Create `frontend/utils/excelParser.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalizeColumnName } from './excelParser';

describe('normalizeColumnName', () => {
  it('lowercases input', () => {
    expect(normalizeColumnName('Revenue')).toBe('revenue');
  });

  it('trims whitespace', () => {
    expect(normalizeColumnName('  date  ')).toBe('date');
  });

  it('replaces spaces with underscores', () => {
    expect(normalizeColumnName('first name')).toBe('first_name');
  });

  it('collapses multiple underscores', () => {
    expect(normalizeColumnName('a__b')).toBe('a_b');
  });

  it('strips trailing underscores', () => {
    expect(normalizeColumnName('hello!')).toBe('hello');
  });

  it('replaces non-alphanumeric chars with underscore', () => {
    expect(normalizeColumnName('Partner ID')).toBe('partner_id');
  });
});
```

- [ ] **Step 4: Create `frontend/utils/kpiEngine.ts`**

```ts
export interface PerformanceRecord {
  affiliate_id?: string;
  country?: string;
  campaign?: string;
  date?: string;
  clicks?: number;
  registrations?: number;
  ftds?: number;
  revenue?: number;
  cost?: number;
  [key: string]: any;
}

export const processKPIs = (data: PerformanceRecord[]) => {
  const initial = { revenue: 0, cost: 0, profit: 0, ftds: 0, clicks: 0, registrations: 0 };

  const totals = data.reduce((acc, row) => {
    acc.revenue       += Number(row.revenue)       || 0;
    acc.cost          += Number(row.cost)           || 0;
    acc.ftds          += Number(row.ftds)           || 0;
    acc.clicks        += Number(row.clicks)         || 0;
    acc.registrations += Number(row.registrations)  || 0;
    return acc;
  }, initial);

  totals.profit = totals.revenue - totals.cost;
  const roi             = totals.cost   > 0 ? totals.profit / totals.cost   : 0;
  const cpa             = totals.ftds   > 0 ? totals.cost   / totals.ftds   : 0;
  const conversion_rate = totals.clicks > 0 ? totals.ftds   / totals.clicks : 0;

  return { ...totals, roi, cpa, conversion_rate };
};

export const getInsights = (data: PerformanceRecord[]) => {
  const affiliateMap: Record<string, { revenue: number; cost: number; profit: number }> = {};

  data.forEach(row => {
    if (!row.affiliate_id) return;
    const aff = row.affiliate_id;
    if (!affiliateMap[aff]) affiliateMap[aff] = { revenue: 0, cost: 0, profit: 0 };
    affiliateMap[aff].revenue += Number(row.revenue) || 0;
    affiliateMap[aff].cost    += Number(row.cost)    || 0;
    affiliateMap[aff].profit  += (Number(row.revenue) || 0) - (Number(row.cost) || 0);
  });

  const affiliates = Object.keys(affiliateMap).map(id => ({
    id,
    ...affiliateMap[id],
    roi: affiliateMap[id].cost > 0 ? affiliateMap[id].profit / affiliateMap[id].cost : 0,
  }));

  const top_affiliates = [...affiliates]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
    .map(a => a.id);

  const worst_affiliates = [...affiliates]
    .sort((a, b) => a.roi - b.roi)
    .filter(a => a.roi < 0)
    .slice(0, 5)
    .map(a => a.id);

  const recommendations: string[] = [];
  if (worst_affiliates.length > 0) {
    recommendations.push(`Review poorly performing affiliates like ${worst_affiliates[0]} who have negative ROI.`);
  } else {
    recommendations.push('All affiliates have a positive ROI. Good work!');
  }
  if (top_affiliates.length > 0) {
    recommendations.push(`Consider incentivizing top earners like ${top_affiliates.slice(0, 2).join(' and ')} for scaling.`);
  }

  return { top_affiliates, worst_affiliates, recommendations };
};
```

- [ ] **Step 5: Create `frontend/utils/excelParser.ts`** (server-side, uses Buffer not FileReader)

```ts
import * as XLSX from 'xlsx';
import type { PerformanceRecord } from './kpiEngine';

const COLUMN_ALIASES: Record<string, string> = {
  partner_id:    'affiliate_id',
  player_country: 'country',
  campaign_name:  'campaign',
  stats_date:     'date',
  ftd_count:      'ftds',
  deposits_sum:   'revenue',
  partner_income: 'cost',
};

export const normalizeColumnName = (name: string): string =>
  name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '');

export const parseBuffer = (buffer: Buffer): PerformanceRecord[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  let allData: PerformanceRecord[] = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const rawJSON = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    const normalized = rawJSON.map(row => {
      const newRow: PerformanceRecord = {};
      for (const key in row) {
        const normKey   = normalizeColumnName(key);
        const aliasedKey = COLUMN_ALIASES[normKey] ?? normKey;
        newRow[aliasedKey] = row[key];
      }
      return newRow;
    });

    allData = [...allData, ...normalized];
  });

  return allData;
};
```

- [ ] **Step 6: Create `frontend/utils/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Run tests — confirm they PASS**

```bash
cd frontend && npm test
```

Expected: all 14 tests pass (`processKPIs` × 5, `getInsights` × 3, `normalizeColumnName` × 6).

- [ ] **Step 8: Commit**

```bash
git add frontend/utils/ frontend/vitest.config.ts
git commit -m "feat: migrate utils — kpiEngine, excelParser (server), cn helper + tests"
```

---

## Task 5: Create the API upload route

**Files:**
- Create: `frontend/app/api/upload/route.ts`

- [ ] **Step 1: Create `frontend/app/api/upload/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { parseBuffer } from '@/utils/excelParser';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Invalid file type. Upload .xlsx, .xls, or .csv' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const data        = parseBuffer(buffer);

  return NextResponse.json({ data });
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/api/
git commit -m "feat: add /api/upload route for server-side Excel parsing"
```

---

## Task 6: Create DataProvider

**Files:**
- Create: `frontend/components/DataProvider.tsx`

- [ ] **Step 1: Create `frontend/components/DataProvider.tsx`**

```tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PerformanceRecord } from '@/utils/kpiEngine';

interface DataContextValue {
  data: PerformanceRecord[];
  loading: boolean;
  upload: (file: File) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData]       = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const upload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error ?? 'Upload failed');
      }
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ data, loading, upload }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/DataProvider.tsx
git commit -m "feat: add DataProvider React Context (data, loading, upload)"
```

---

## Task 7: Create KPICard

**Files:**
- Create: `frontend/components/KPICard.tsx`

- [ ] **Step 1: Create `frontend/components/KPICard.tsx`**

```tsx
interface KPICardProps {
  label: string;
  value: string | number;
  color: string;
}

export function KPICard({ label, value, color }: KPICardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-5 text-center hover:-translate-y-0.5 transition-transform shadow-[0_4px_24px_rgba(0,212,255,0.05)]">
      <div className="text-xs text-[#94a3b8] uppercase tracking-widest mb-2 font-semibold">
        {label}
      </div>
      <div className="text-[1.8rem] font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/KPICard.tsx
git commit -m "feat: add KPICard component with Tailwind styles"
```

---

## Task 8: Create chart components

**Files:**
- Create: `frontend/components/charts/PerformanceChart.tsx`
- Create: `frontend/components/charts/CountryPieChart.tsx`
- Create: `frontend/components/charts/AffiliatesBarChart.tsx`

- [ ] **Step 1: Create `frontend/components/charts/PerformanceChart.tsx`**

```tsx
'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export function PerformanceChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 h-[400px]">
      <p className="text-base font-semibold mb-4 text-[#e2e8f0]">Performance Over Time</p>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <XAxis dataKey="date"  stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis                 stroke="#64748b" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
          <Area type="monotone" dataKey="revenue" stroke="#00d4ff" fillOpacity={1} fill="url(#colorRev)"    />
          <Area type="monotone" dataKey="cost"    stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)"   />
          <Area type="monotone" dataKey="profit"  stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/components/charts/CountryPieChart.tsx`**

```tsx
'use client';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

interface DataPoint {
  name: string;
  value: number;
}

export function CountryPieChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 h-[400px]">
      <p className="text-base font-semibold mb-4 text-[#e2e8f0]">Revenue by Country</p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/components/charts/AffiliatesBarChart.tsx`**

```tsx
'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  affiliate_id: string;
  profit: number;
}

export function AffiliatesBarChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 mt-6">
      <p className="text-base font-semibold mb-4 text-[#e2e8f0]">Top 10 Affiliates by Profit</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" stroke="#64748b" />
          <YAxis
            type="category"
            dataKey="affiliate_id"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip
            cursor={{ fill: 'rgba(30,41,59,0.5)' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
          />
          <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.profit > 0 ? '#00d4ff' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/components/charts/
git commit -m "feat: add PerformanceChart, CountryPieChart, AffiliatesBarChart components"
```

---

## Task 9: Create Sidebar

**Files:**
- Create: `frontend/components/Sidebar.tsx`

- [ ] **Step 1: Create `frontend/components/Sidebar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadCloud, LayoutDashboard, Users, Megaphone, Lightbulb, Table } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useData } from './DataProvider';

const tabs = [
  { href: '/overview',   label: 'Overview',   Icon: LayoutDashboard },
  { href: '/affiliates', label: 'Affiliates',  Icon: Users            },
  { href: '/campaigns',  label: 'Campaigns',   Icon: Megaphone        },
  { href: '/insights',   label: 'Insights',    Icon: Lightbulb        },
  { href: '/data',       label: 'Data',        Icon: Table            },
];

export function Sidebar() {
  const pathname    = usePathname();
  const { upload }  = useData();

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Please drop an Excel file (.xlsx, .xls, or .csv)');
      return;
    }
    upload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) upload(e.target.files[0]);
  };

  return (
    <aside className="w-64 bg-[#0d1427] border-r border-[#1e293b] h-screen sticky top-0 flex flex-col gap-6 p-5">
      <h2 className="text-[#e2e8f0] text-2xl font-bold flex items-center gap-2">
        📊 ROI Dashboard
      </h2>

      <div
        className="border-2 border-dashed border-[#1e3a5f] rounded-xl p-5 text-center cursor-pointer bg-[rgba(13,20,39,0.7)] transition-colors hover:border-primary"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud size={32} className="text-[#94a3b8] mx-auto" />
        <p className="text-xs text-[#94a3b8] my-2">Drag Excel here</p>
        <label className="inline-block bg-gradient-to-r from-sky-500 to-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs mt-1">
          Browse
          <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileChange} />
        </label>
      </div>

      <div className="h-px bg-[#1e293b]" />

      <nav className="flex flex-col gap-2">
        {tabs.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === href
                ? 'bg-[#1e293b]/50 text-[#e2e8f0]'
                : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#e2e8f0]'
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Sidebar.tsx
git commit -m "feat: add Sidebar with Next.js Link navigation and file upload"
```

---

## Task 10: Create MainContent wrapper

**Files:**
- Create: `frontend/components/MainContent.tsx`

- [ ] **Step 1: Create `frontend/components/MainContent.tsx`**

```tsx
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
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/MainContent.tsx
git commit -m "feat: add MainContent wrapper with drag-drop and empty state"
```

---

## Task 11: Create root layout and redirect

**Files:**
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`

- [ ] **Step 1: Create `frontend/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider }  from '@/components/DataProvider';
import { Sidebar }       from '@/components/Sidebar';
import { MainContent }   from '@/components/MainContent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ROI Dashboard',
  description: 'Affiliate performance analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-[#e2e8f0] min-h-screen font-sans">
        <DataProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <MainContent>
              {children}
            </MainContent>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `frontend/app/page.tsx`**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/overview');
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/page.tsx
git commit -m "feat: add root layout with DataProvider/Sidebar/MainContent and / redirect"
```

---

## Task 12: Create Overview page

**Files:**
- Create: `frontend/app/overview/page.tsx`

- [ ] **Step 1: Create `frontend/app/overview/page.tsx`**

```tsx
'use client';

import { useData }             from '@/components/DataProvider';
import { KPICard }             from '@/components/KPICard';
import { PerformanceChart }    from '@/components/charts/PerformanceChart';
import { CountryPieChart }     from '@/components/charts/CountryPieChart';
import { AffiliatesBarChart }  from '@/components/charts/AffiliatesBarChart';
import { processKPIs }         from '@/utils/kpiEngine';

export default function OverviewPage() {
  const { data } = useData();
  const kpis     = processKPIs(data);

  const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const pctFmt  = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

  // Time series
  const timeMap: Record<string, { date: string; revenue: number; cost: number; profit: number }> = {};
  data.forEach(d => {
    if (!d.date) return;
    if (!timeMap[d.date]) timeMap[d.date] = { date: d.date, revenue: 0, cost: 0, profit: 0 };
    timeMap[d.date].revenue += Number(d.revenue) || 0;
    timeMap[d.date].cost    += Number(d.cost)    || 0;
    timeMap[d.date].profit  += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
  });
  const timeData = Object.values(timeMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Top affiliates by profit
  const affMap: Record<string, number> = {};
  data.forEach(d => {
    if (!d.affiliate_id) return;
    affMap[d.affiliate_id] = (affMap[d.affiliate_id] || 0) + ((Number(d.revenue) || 0) - (Number(d.cost) || 0));
  });
  const topAffiliates = Object.keys(affMap)
    .map(key => ({ affiliate_id: key, profit: affMap[key] }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  // Revenue by country
  const countryMap: Record<string, number> = {};
  data.forEach(d => {
    if (!d.country) return;
    countryMap[d.country] = (countryMap[d.country] || 0) + (Number(d.revenue) || 0);
  });
  const countryData = Object.keys(countryMap).map(key => ({ name: key, value: countryMap[key] }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Overview</h1>
        <p className="text-[#94a3b8]">Key Performance Indicators</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KPICard label="Revenue"     value={currFmt.format(kpis.revenue)}          color="#00d4ff" />
        <KPICard label="Cost"        value={currFmt.format(kpis.cost)}             color="#f59e0b" />
        <KPICard label="Profit"      value={currFmt.format(kpis.profit)}           color="#10b981" />
        <KPICard label="ROI"         value={pctFmt.format(kpis.roi)}               color="#7c3aed" />
        <KPICard label="FTDs"        value={kpis.ftds.toLocaleString()}            color="#ec4899" />
        <KPICard label="CPA"         value={currFmt.format(kpis.cpa)}              color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart data={timeData} />
        <CountryPieChart  data={countryData} />
      </div>

      <AffiliatesBarChart data={topAffiliates} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/overview/
git commit -m "feat: add Overview page with KPI grid and charts"
```

---

## Task 13: Create Affiliates page

**Files:**
- Create: `frontend/app/affiliates/page.tsx`

- [ ] **Step 1: Create `frontend/app/affiliates/page.tsx`**

```tsx
'use client';

import { useData } from '@/components/DataProvider';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AffiliatesPage() {
  const { data } = useData();

  const affMap: Record<string, { affiliate_id: string; clicks: number; ftds: number; revenue: number; cost: number; profit: number }> = {};
  data.forEach(d => {
    const aff = d.affiliate_id || d.affiliate;
    if (!aff) return;
    if (!affMap[aff]) affMap[aff] = { affiliate_id: aff, clicks: 0, ftds: 0, revenue: 0, cost: 0, profit: 0 };
    affMap[aff].clicks  += Number(d.clicks)  || 0;
    affMap[aff].ftds    += Number(d.ftds)    || 0;
    affMap[aff].revenue += Number(d.revenue) || 0;
    affMap[aff].cost    += Number(d.cost)    || 0;
    affMap[aff].profit  += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
  });

  const tableData = Object.values(affMap).map(row => ({
    ...row,
    roi:             row.cost   > 0 ? row.profit / row.cost   : 0,
    cpa:             row.ftds   > 0 ? row.cost   / row.ftds   : 0,
    conversion_rate: row.clicks > 0 ? row.ftds   / row.clicks : 0,
  })).sort((a, b) => b.profit - a.profit);

  const currFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const pctFmt  = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Affiliates</h1>
        <p className="text-[#94a3b8]">Detailed Affiliate Performance</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e293b] bg-[#0d1427]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {['Affiliate ID','Clicks','FTDs','Revenue','Cost','Profit','ROI','CPA'].map(h => (
                <th key={h} className="px-4 py-3 bg-[#0a0f1e]/90 text-[#94a3b8] text-xs uppercase font-semibold border-b border-[#1e293b]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#1e293b]/30 transition-colors">
                <td className="px-4 py-3 border-b border-[#1e293b]">{row.affiliate_id}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]">{row.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]">{row.ftds.toLocaleString()}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]">{currFmt.format(row.revenue)}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]">{currFmt.format(row.cost)}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]" style={{ color: row.profit >= 0 ? '#10b981' : '#ef4444' }}>{currFmt.format(row.profit)}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]" style={{ color: row.roi    >= 0 ? '#10b981' : '#ef4444' }}>{pctFmt.format(row.roi)}</td>
                <td className="px-4 py-3 border-b border-[#1e293b]">{currFmt.format(row.cpa)}</td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#94a3b8]">No affiliate data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 mt-6 h-[480px]">
        <p className="text-base font-semibold mb-4 text-[#e2e8f0]">Clicks vs Profit</p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number"   dataKey="clicks"       name="Total Clicks" stroke="#64748b" />
            <YAxis type="number"   dataKey="profit"       name="Profit"       stroke="#64748b" tickFormatter={v => `$${v}`} />
            <ZAxis type="category" dataKey="affiliate_id" name="Affiliate" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }} />
            <Scatter name="Affiliates" data={tableData} fill="#0ea5e9" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/affiliates/
git commit -m "feat: add Affiliates page with table and scatter chart"
```

---

## Task 14: Create Campaigns page

**Files:**
- Create: `frontend/app/campaigns/page.tsx`

- [ ] **Step 1: Create `frontend/app/campaigns/page.tsx`**

```tsx
'use client';

import { useData } from '@/components/DataProvider';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

export default function CampaignsPage() {
  const { data } = useData();

  const campMap: Record<string, { campaign: string; profit: number; cost: number; revenue: number }> = {};
  data.forEach(d => {
    const camp = d.campaign || d.brand;
    if (!camp) return;
    if (!campMap[camp]) campMap[camp] = { campaign: camp, profit: 0, cost: 0, revenue: 0 };
    campMap[camp].profit  += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
    campMap[camp].cost    += Number(d.cost)    || 0;
    campMap[camp].revenue += Number(d.revenue) || 0;
  });

  const campData = Object.values(campMap)
    .map(c => ({ ...c, roi: c.cost > 0 ? c.profit / c.cost : 0 }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  const pctFmt = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Campaigns</h1>
        <p className="text-[#94a3b8]">Top Campaigns by ROI</p>
      </div>

      <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 h-[500px]">
        <p className="text-base font-semibold mb-4 text-[#e2e8f0]">ROI by Campaign</p>
        {campData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={campData} margin={{ top: 20 }}>
              <XAxis dataKey="campaign" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tickFormatter={v => pctFmt.format(v)} />
              <Tooltip
                formatter={v => pctFmt.format(Number(v))}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
              />
              <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                {campData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.roi >= 0 ? '#7c3aed' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#94a3b8]">No campaign data available.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/campaigns/
git commit -m "feat: add Campaigns page with ROI bar chart"
```

---

## Task 15: Create Insights page

**Files:**
- Create: `frontend/app/insights/page.tsx`

- [ ] **Step 1: Create `frontend/app/insights/page.tsx`**

```tsx
'use client';

import { useData }      from '@/components/DataProvider';
import { getInsights }  from '@/utils/kpiEngine';

export default function InsightsPage() {
  const { data } = useData();
  const { top_affiliates, worst_affiliates, recommendations } = getInsights(data);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Insights</h1>
        <p className="text-[#94a3b8]">Automated Analysis & Recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5">
          <p className="text-base font-semibold mb-4 text-primary">🏆 Top Performers</p>
          {top_affiliates.map((aff, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#1e3a5f]/60 to-[#0f172a]/60 border-l-[3px] border-primary rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
            >
              <span className="text-primary font-bold">#{idx + 1}</span>{' '}
              <strong>{aff}</strong>
            </div>
          ))}
          {top_affiliates.length === 0 && <p className="text-[#94a3b8]">Not enough data.</p>}
        </div>

        <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5">
          <p className="text-base font-semibold mb-4 text-danger">⚠️ Underperformers (Negative ROI)</p>
          {worst_affiliates.map((aff, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#1e3a5f]/60 to-[#0f172a]/60 border-l-[3px] border-danger rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
            >
              <span className="text-danger font-bold">Action Needed</span>{' '}
              <strong>{aff}</strong>
            </div>
          ))}
          {worst_affiliates.length === 0 && (
            <p className="text-success">No underperforming affiliates detected.</p>
          )}
        </div>
      </div>

      <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 mt-6">
        <p className="text-base font-semibold mb-4 text-[#e2e8f0]">💡 Recommendations</p>
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0f172a]/60 border-l-[3px] border-warning rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
          >
            <span className="text-warning">▸</span> {rec}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/insights/
git commit -m "feat: add Insights page with top/worst affiliates and recommendations"
```

---

## Task 16: Create Data page

**Files:**
- Create: `frontend/app/data/page.tsx`

- [ ] **Step 1: Create `frontend/app/data/page.tsx`**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/data/
git commit -m "feat: add Data page with paginated raw records table"
```

---

## Task 17: Update vercel.json

**Files:**
- Modify: `vercel.json` (repo root)

- [ ] **Step 1: Replace `vercel.json`**

```json
{
  "rootDirectory": "frontend",
  "framework": "nextjs"
}
```

Next.js on Vercel auto-detects build and output settings — no need to set `buildCommand` or `outputDirectory` manually.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "chore: update vercel.json for Next.js framework"
```

---

## Task 18: Remove old Vite files and verify build

**Files:**
- Delete: `frontend/src/`
- Delete: `frontend/vite.config.ts`
- Delete: `frontend/index.html`
- Delete: `frontend/tsconfig.app.json`
- Delete: `frontend/tsconfig.node.json`
- Delete: `frontend/eslint.config.js`

- [ ] **Step 1: Run the dev server and manually verify all 5 pages load**

```bash
cd frontend && npm run dev
```

Open http://localhost:3000. Check:
- `/` redirects to `/overview`
- Sidebar renders with all 5 links
- Upload an Excel file — KPIs and charts appear on Overview
- Navigate to Affiliates, Campaigns, Insights, Data — all render correctly
- Drag-drop a file onto the main content area — file uploads and data refreshes

- [ ] **Step 2: Run production build — confirm zero errors**

```bash
cd frontend && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Run tests one final time**

```bash
cd frontend && npm test
```

Expected: All tests pass.

- [ ] **Step 4: Delete old Vite source files**

```bash
cd frontend
rm -rf src vite.config.ts index.html tsconfig.app.json tsconfig.node.json eslint.config.js
```

- [ ] **Step 5: Commit everything**

```bash
git add -A
git commit -m "feat: complete Next.js 15 + Tailwind v4 migration

- URL-based routing with App Router (5 pages)
- Server-side Excel parsing via /api/upload
- React Context (DataProvider) for client state
- Tailwind v4 replaces custom CSS
- Recharts charts extracted into dedicated components
- Vitest unit tests for kpiEngine and excelParser utils
- Removes Vite build tooling"
```
