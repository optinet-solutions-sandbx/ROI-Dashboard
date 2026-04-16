import React, { useState } from 'react';
import type { PerformanceRecord } from '../utils/kpiEngine';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

const PAGE_SIZE = 20;

export const Affiliates: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const [page, setPage] = useState(1);

  // Aggregate data for affiliates table
  const affMap: Record<string, any> = {};
  data.forEach(d => {
    if (!d.affiliate_id && !d.affiliate) return;
    const aff = d.affiliate_id || d.affiliate;
    if (!affMap[aff]) affMap[aff] = { affiliate_id: aff, clicks: 0, ftds: 0, revenue: 0, cost: 0, profit: 0 };
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
    conversion_rate: row.clicks > 0 ? row.ftds / row.clicks : 0,
  })).sort((a, b) => b.profit - a.profit);

  const totalPages  = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageStart   = (safePage - 1) * PAGE_SIZE;
  const pageData    = tableData.slice(pageStart, pageStart + PAGE_SIZE);

  // Determine scatter X axis: prefer clicks if non-zero, otherwise use ftds
  const hasClicks   = tableData.some(r => r.clicks > 0);
  const scatterX    = hasClicks ? 'clicks' : 'ftds';
  const scatterLabel = hasClicks ? 'Clicks' : 'FTDs';

  const formatter    = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

  // Page number buttons — show at most 5 pages around current
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

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
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
                <td>{row.affiliate_id}</td>
                <td>{row.clicks.toLocaleString()}</td>
                <td>{row.ftds.toLocaleString()}</td>
                <td>{formatter.format(row.revenue)}</td>
                <td>{formatter.format(row.cost)}</td>
                <td style={{ color: row.profit >= 0 ? '#10b981' : '#ef4444' }}>{formatter.format(row.profit)}</td>
                <td style={{ color: row.roi   >= 0 ? '#10b981' : '#ef4444' }}>{pctFormatter.format(row.roi)}</td>
                <td>{formatter.format(row.cpa)}</td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No affiliate data found.</td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination__info">
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, tableData.length)} of {tableData.length} affiliates
            </span>
            <div className="pagination__controls">
              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                ‹ Prev
              </button>

              {pageButtons.map((btn, i) =>
                btn === '…'
                  ? <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                  : <button
                      key={btn}
                      className={`pagination__btn${safePage === btn ? ' active' : ''}`}
                      onClick={() => setPage(btn as number)}
                    >
                      {btn}
                    </button>
              )}

              <button
                className="pagination__btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="chart-card" style={{ marginTop: '24px' }}>
        <div className="chart-title">{scatterLabel} vs Profit</div>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <XAxis
              type="number"
              dataKey={scatterX}
              name={scatterLabel}
              stroke="#2d3e52"
              tick={{ fontSize: 11, fill: '#536b87' }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              label={{ value: scatterLabel, position: 'insideBottom', offset: -10, fill: '#536b87', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="profit"
              name="Profit"
              stroke="#2d3e52"
              tick={{ fontSize: 11, fill: '#536b87' }}
              tickFormatter={(val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`}
              width={60}
            />
            <ZAxis type="category" dataKey="affiliate_id" name="Affiliate" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#0d1628', borderColor: '#1e293b', color: '#e9eef5' }}
              formatter={(value, name) => {
                if (name === 'Profit') return [`$${Number(value ?? 0).toLocaleString()}`, String(name ?? '')];
                return [Number(value ?? 0).toLocaleString(), String(name ?? '')];
              }}
            />
            <Scatter name="Affiliates" data={tableData} fill="#0ea5e9" opacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
