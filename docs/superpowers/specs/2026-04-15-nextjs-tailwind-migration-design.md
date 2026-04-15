# Next.js + Tailwind Migration Design

**Date:** 2026-04-15  
**Status:** Approved  
**Scope:** Migrate the existing Vite/React frontend to Next.js 15 (App Router) + Tailwind CSS, with a stateless server-side Excel parsing API route.

---

## Overview

The ROI Dashboard is currently a Vite + React + TypeScript SPA with custom CSS. This migration converts it to Next.js 15 (App Router) + Tailwind CSS while preserving the existing feature set exactly. TypeScript is already in use and carries over unchanged.

**What changes:**
- Build tool: Vite → Next.js 15
- Routing: tab-based state → URL-based routing via App Router
- Styling: custom CSS classes → Tailwind utility classes with custom color tokens
- File parsing: client-side (xlsx in browser) → server-side (`/api/upload` route handler)
- Navigation: `setActiveTab` state → Next.js `<Link>` + `usePathname()`

**What stays the same:**
- All 5 dashboard pages and their content (Overview, Affiliates, Campaigns, Insights, Data)
- All KPI calculations (`kpiEngine.ts` — pure functions, unchanged)
- All chart library (Recharts)
- All icon library (Lucide React)
- The dark navy color palette and visual design
- TypeScript throughout

---

## Architecture

### Folder Structure

```
app/
  layout.tsx               ← Server Component: root layout, renders DataProvider + Sidebar + {children}
  page.tsx                 ← Redirects to /overview
  overview/
    page.tsx               ← "use client", reads from DataContext
  affiliates/
    page.tsx               ← "use client"
  campaigns/
    page.tsx               ← "use client"
  insights/
    page.tsx               ← "use client"
  data/
    page.tsx               ← "use client"
  api/
    upload/
      route.ts             ← POST handler: receives file, parses with xlsx, returns PerformanceRecord[]

components/
  Sidebar.tsx              ← "use client" (file upload trigger + Link navigation + usePathname)
  KPICard.tsx              ← pure display component (no client directive needed)
  DataProvider.tsx         ← "use client" (React Context: data, loading, upload())
  charts/
    PerformanceChart.tsx   ← "use client" (Recharts AreaChart)
    CountryPieChart.tsx    ← "use client" (Recharts PieChart)
    AffiliatesBarChart.tsx ← "use client" (Recharts BarChart)

utils/
  kpiEngine.ts             ← unchanged (pure functions: processKPIs, getInsights)
```

### Key Decisions

- **All page components are `"use client"`** — they read data from React Context, which requires client-side rendering. There are no async server data fetches per page.
- **`layout.tsx` is a Server Component** — it renders the DataProvider and Sidebar around `{children}`. The DataProvider is a client component but can be rendered from a Server Component parent.
- **No `loading.tsx` or `error.tsx`** — data comes from user file upload (not server fetches), so Suspense-based loading boundaries provide no benefit here. Loading state is managed inside DataProvider.
- **Charts stay in dedicated components** — extracted from page files to keep page files lean and isolate the `"use client"` boundary.

---

## Data Flow

```
User drops / selects file (Sidebar)
        ↓
upload(file) called on DataContext
        ↓
POST /api/upload  (FormData with file)
        ↓
route.ts: reads file buffer → xlsx.read() → extracts first sheet → maps rows to PerformanceRecord[]
        ↓
Returns { data: PerformanceRecord[] } as JSON
        ↓
DataProvider stores result via setData(), sets loading = false
        ↓
All pages read data via useData() hook
        ↓
Pages pass data slices to chart components / kpiEngine functions
```

### DataProvider Interface

```ts
interface DataContextValue {
  data: PerformanceRecord[];
  loading: boolean;
  upload: (file: File) => Promise<void>;
}
```

### API Route (`/api/upload`)

- **Method:** POST
- **Body:** `multipart/form-data` with a `file` field
- **Accepts:** `.xlsx`, `.xls`, `.csv`
- **Returns:** `{ data: PerformanceRecord[] }`
- **Error:** `{ error: string }` with appropriate HTTP status
- **Processing:** Uses `xlsx` library on the server; reads buffer, extracts first sheet, converts rows to objects using sheet header row as keys, returns typed array.

### PerformanceRecord (unchanged)

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
```

---

## Routing

| URL | Page |
|-----|------|
| `/` | Redirect → `/overview` |
| `/overview` | Overview (KPI cards + charts) |
| `/affiliates` | Affiliates breakdown |
| `/campaigns` | Campaigns breakdown |
| `/insights` | Insights + recommendations |
| `/data` | Raw data table |

Navigation uses Next.js `<Link>` components. Active state detected via `usePathname()` — replaces the `activeTab` state and `setActiveTab` prop drilling.

---

## Styling

### Tailwind Configuration (v4)

Tailwind v4 uses CSS-based configuration — no `tailwind.config.ts`. Custom tokens are defined in `app/globals.css` using the `@theme` directive:

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

  --font-sans: 'Inter', sans-serif;
}
```

These map to Tailwind classes like `bg-bg`, `bg-bg-sidebar`, `text-primary`, `border-border`, etc.

### Migration Rules

- `index.css` → replaced with `@tailwind base; @tailwind components; @tailwind utilities;` directives only
- CSS class names (`.kpi-card`, `.sidebar`, `.chart-card`, etc.) → replaced with Tailwind utility strings in JSX
- Inline `style={{}}` objects → replaced with Tailwind classes where possible (SVG/Recharts fill props remain as hex values)
- Conditional classes use a `cn()` helper (`clsx` + `tailwind-merge`)
- Inter font loaded via `next/font/google` in `layout.tsx`

### Example Translations

| Old CSS class | Tailwind equivalent |
|---------------|---------------------|
| `.sidebar` | `w-64 bg-bg-sidebar border-r border-border h-screen sticky top-0 flex flex-col gap-6 p-5` |
| `.kpi-card` | `bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-5 text-center` |
| `.chart-card` | `bg-bg-sidebar border border-border rounded-xl p-5 h-[400px]` |
| `.nav-link.active` | `bg-slate-800/50 text-slate-100` |

---

## Dependencies

### Add
- `next` (v15)
- `tailwindcss`, `@tailwindcss/postcss`, `autoprefixer`
- `clsx`, `tailwind-merge`

### Remove
- `vite`, `@vitejs/plugin-react`
- `vite.config.ts`

### Keep
- `react`, `react-dom`
- `lucide-react`
- `recharts`
- `xlsx`
- All TypeScript and ESLint tooling

---

## Out of Scope

- Authentication / user accounts
- Data persistence (database, file storage)
- The Python backend (`main.py`, `pyproject.toml`) — untouched
- Any new dashboard features or KPI changes
- Dark/light mode toggle
