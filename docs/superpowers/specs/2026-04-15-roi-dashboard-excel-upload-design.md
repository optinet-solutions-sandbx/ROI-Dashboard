# ROI Dashboard — Excel Upload & Data Table Design

**Date:** 2026-04-15
**Status:** Approved

## Summary

Three coordinated changes to the existing React/TypeScript dashboard:
1. Fix the dashboard title from "RIO Dashboard" to "ROI Dashboard"
2. Fix Excel column mapping so the real data file drives all existing KPI charts
3. Add drag-and-drop to the main content area + a new paginated Data tab

---

## Section 1 — Title Fix

**File:** `frontend/src/components/Sidebar.tsx` line 33

Change the `<h2>` text from `📊 RIO Dashboard` to `📊 ROI Dashboard`.

---

## Section 2 — Column Mapping Fix

**File:** `frontend/src/utils/excelParser.ts`

After the existing column normalization step (lowercase, replace spaces with `_`), apply a fixed alias map to translate the actual Excel column names into the field names expected by `kpiEngine.ts`:

| Normalized Excel column | kpiEngine field |
|---|---|
| `partner_id` | `affiliate_id` |
| `player_country` | `country` |
| `campaign_name` | `campaign` |
| `stats_date` | `date` |
| `ftd_count` | `ftds` |
| `deposits_sum` | `revenue` |
| `partner_income` | `cost` |

All other columns are passed through unchanged. This fix makes the existing Overview, Affiliates, Campaigns, and Insights pages render correctly with the real Excel data (Main_03042026.xlsx, "Data" sheet, 90,339 rows).

---

## Section 3 — Main Content Drag-and-Drop Overlay

**File:** `frontend/src/App.tsx`

Add `onDragOver`, `onDragLeave`, and `onDrop` handlers to the `<main>` element. A boolean state `isDraggingOver` controls an overlay:

- **Overlay appearance:** full-viewport semi-transparent dark backdrop, centered dashed-border box, text "Drop your Excel file here"
- **On drop:** calls the existing `handleFileUpload` function — no duplicate logic
- **On drag leave / drop:** overlay disappears

The sidebar uploader remains unchanged and continues to work as before.

---

## Section 4 — Data Tab

### 4a — Sidebar nav entry

**File:** `frontend/src/components/Sidebar.tsx`

Add a new tab entry to the `tabs` array:
```ts
{ id: 'Data', label: 'Data', icon: <Table size={20} /> }
```
Import `Table` from `lucide-react`.

### 4b — Data page component

**File:** `frontend/src/pages/Data.tsx` (new file)

Props: `{ data: PerformanceRecord[] }`

Behaviour:
- Page header: title "Data", subtitle "Raw records from uploaded file"
- Derive column headers from `Object.keys(data[0])` — the data is already normalized+aliased at this point, so display the stored keys with `_` replaced by a space and each word title-cased (e.g., `affiliate_id` → "Affiliate Id", `campaign_name` → "Campaign Name").
- **50 rows per page**, `page` state starts at 0
- Row count indicator: `Showing {start}–{end} of {total} rows`
- Horizontally scrollable table for the 23 columns
- Zebra-striped rows (alternating background)
- Prev / Next buttons at bottom; Prev disabled on page 0, Next disabled on last page

### 4c — Wire up in App.tsx

**File:** `frontend/src/App.tsx`

Add import for `Data` component and add:
```tsx
{activeTab === 'Data' && <Data data={data} />}
```
alongside the existing tab conditionals.

---

## Files Changed

| File | Change type |
|---|---|
| `frontend/src/components/Sidebar.tsx` | Edit — title text + new Data nav tab |
| `frontend/src/utils/excelParser.ts` | Edit — add column alias map |
| `frontend/src/App.tsx` | Edit — drag overlay state/handlers + Data tab render |
| `frontend/src/pages/Data.tsx` | New — paginated raw data table |

## Files Unchanged

All other pages (Overview, Affiliates, Campaigns, Insights, KPICard, kpiEngine) require no changes — the column mapping fix in excelParser feeds them correctly.

---

## Out of Scope

- Search / filter on the Data table (deferred)
- Column sorting
- Export to CSV
- Backend changes
