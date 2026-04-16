import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { PerformanceRecord } from '../utils/kpiEngine';
import { useChartColors } from '../lib/theme';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import { ReferenceLine } from 'recharts';

const PAGE_SIZE = 20;

const LINE_COLORS = ['#00d4ff', '#f0b429', '#10b981', '#ec4899', '#818cf8', '#f97316'];

export const Affiliates: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const [page, setPage]           = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { axisColor, axisStroke, gridStroke, tooltipStyle } = useChartColors();

  /* ── Aggregate per-affiliate totals ── */
  const affMap: Record<string, any> = {};
  data.forEach(d => {
    if (!d.affiliate_id && !d.affiliate) return;
    const aff = d.affiliate_id || d.affiliate;
    if (!affMap[aff]) affMap[aff] = { affiliate_id: aff, affiliate_name: d.affiliate_name ?? '', clicks: 0, ftds: 0, revenue: 0, cost: 0, profit: 0 };
    if (d.affiliate_name && !affMap[aff].affiliate_name) affMap[aff].affiliate_name = d.affiliate_name;
    affMap[aff].clicks  += Number(d.clicks)  || 0;
    affMap[aff].ftds    += Number(d.ftds)    || 0;
    affMap[aff].revenue += Number(d.revenue) || 0;
    affMap[aff].cost    += Number(d.cost)    || 0;
    affMap[aff].profit  += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
  });

  const tableData = Object.values(affMap).map(row => ({
    ...row,
    roi: row.cost > 0 ? row.profit / row.cost : 0,
    cpa: row.ftds > 0 ? row.cost / row.ftds : 0,
  })).sort((a, b) => b.profit - a.profit);

  /* ── Search filter ── */
  const filteredData = searchTerm.trim() === ''
    ? tableData
    : tableData.filter(row => {
        const q = searchTerm.toLowerCase();
        return (
          String(row.affiliate_id   ?? '').toLowerCase().includes(q) ||
          String(row.affiliate_name ?? '').toLowerCase().includes(q)
        );
      });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // reset to page 1 on new search
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * PAGE_SIZE;
  const pageData   = filteredData.slice(pageStart, pageStart + PAGE_SIZE);

  /* ── Top 6 affiliates monthly profit line chart ── */
  const top6Ids = tableData.slice(0, 6).map(a => a.affiliate_id);

  const monthlyMap: Record<string, Record<string, number>> = {};
  data.forEach(d => {
    const aff = d.affiliate_id || d.affiliate;
    if (!aff || !d.date || !top6Ids.includes(aff)) return;
    const raw = String(d.date);
    const monthKey = raw.length >= 7 ? raw.slice(0, 7) : raw;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = {};
    const profit = (Number(d.revenue) || 0) - (Number(d.cost) || 0);
    monthlyMap[monthKey][aff] = (monthlyMap[monthKey][aff] || 0) + profit;
  });

  const lineData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, vals]) => {
      let label = monthKey;
      try {
        label = new Date(monthKey + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } catch {}
      return { month: label, ...vals };
    });

  const formatter    = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

  const pageButtons = (() => {
    const btns: (number | '…')[] = [];
    const delta = 2;
    const left  = Math.max(1, safePage - delta);
    const right = Math.min(totalPages, safePage + delta);
    if (left > 1)           { btns.push(1); if (left > 2) btns.push('…'); }
    for (let i = left; i <= right; i++) btns.push(i);
    if (right < totalPages) { if (right < totalPages - 1) btns.push('…'); btns.push(totalPages); }
    return btns;
  })();

  return (
    <div>
      <div className="header">
        <h1>Affiliates</h1>
        <p>Detailed Affiliate Performance</p>
      </div>

      {/* ── Net Profit by Affiliate (line chart) ── */}
      <div className="chart-card" style={{ marginBottom: 20, minHeight: lineData.length > 1 ? 360 : 'auto' }}>
        <div className="chart-title">Net Profit by Affiliate — Top 6</div>

        {lineData.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" opacity={0.5} />
              <XAxis
                dataKey="month"
                stroke={axisStroke}
                tick={{ fontSize: 11, fill: axisColor }}
                tickLine={false}
              />
              <YAxis
                stroke={axisStroke}
                tick={{ fontSize: 11, fill: axisColor }}
                tickFormatter={(v) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `$${(v / 1_000).toFixed(0)}k` : `$${v}`}
                width={60}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, name: any) => [formatter.format(Number(value ?? 0)), String(name)]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: 12 }}
              />
              <ReferenceLine y={0} stroke={axisStroke} strokeDasharray="6 3" strokeWidth={1} />
              {top6Ids.map((id, idx) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 0, fill: LINE_COLORS[idx % LINE_COLORS.length] }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '24px 0', color: axisColor, fontSize: '0.875rem', textAlign: 'center' }}>
            {lineData.length === 0
              ? 'No time-series data available.'
              : 'Only one time period detected — upload multi-month data to see trend lines.'}
          </div>
        )}
      </div>

      {/* ── Affiliate Search ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: axisColor, pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search by affiliate name or ID…"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 32px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              aria-label="Clear search"
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: axisColor,
                display: 'flex', alignItems: 'center', padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {searchTerm && (
          <span style={{ fontSize: '0.8rem', color: axisColor }}>
            {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Affiliate Table ── */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Affiliate Name</th>
              <th>Affiliate ID</th>
              <th>Clicks</th>
              <th>FTDs</th>
              <th>Revenue</th>
              <th>Cost</th>
              <th>Profit</th>
              <th>ROI</th>
              <th>CPA</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ color: axisColor, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {String(pageStart + idx + 1).padStart(2, '0')}
                </td>
                <td style={{ fontWeight: 500 }}>{row.affiliate_name || '—'}</td>
                <td style={{ fontWeight: 500 }}>{row.affiliate_id}</td>
                <td>{row.clicks.toLocaleString()}</td>
                <td>{row.ftds.toLocaleString()}</td>
                <td>{formatter.format(row.revenue)}</td>
                <td>{formatter.format(row.cost)}</td>
                <td style={{ color: row.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {formatter.format(row.profit)}
                </td>
                <td style={{ color: row.roi >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                  {pctFormatter.format(row.roi)}
                </td>
                <td style={{ color: 'var(--text-primary)' }}>{formatter.format(row.cpa)}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: axisColor, padding: '32px 0' }}>
                  {searchTerm ? `No affiliates match "${searchTerm}".` : 'No affiliate data found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination__info">
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredData.length)} of {filteredData.length} affiliates
              {searchTerm && tableData.length !== filteredData.length && ` (filtered from ${tableData.length})`}
            </span>
            <div className="pagination__controls">
              <button className="pagination__btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                ‹ Prev
              </button>
              {pageButtons.map((btn, i) =>
                btn === '…'
                  ? <span key={`el-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                  : <button
                      key={btn}
                      className={`pagination__btn${safePage === btn ? ' active' : ''}`}
                      onClick={() => setPage(btn as number)}
                    >{btn}</button>
              )}
              <button className="pagination__btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
