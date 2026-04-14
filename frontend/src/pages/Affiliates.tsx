import React from 'react';
import type { PerformanceRecord } from '../utils/kpiEngine';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

export const Affiliates: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  // Aggregate data for affiliates table
  const affMap: Record<string, any> = {};
  data.forEach(d => {
    if (!d.affiliate_id && !d.affiliate) return;
    const aff = d.affiliate_id || d.affiliate;
    if (!affMap[aff]) affMap[aff] = { affiliate_id: aff, clicks: 0, ftds: 0, revenue: 0, cost: 0, profit: 0 };
    affMap[aff].clicks += Number(d.clicks) || 0;
    affMap[aff].ftds += Number(d.ftds) || 0;
    affMap[aff].revenue += Number(d.revenue) || 0;
    affMap[aff].cost += Number(d.cost) || 0;
    affMap[aff].profit += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
  });

  const tableData = Object.values(affMap).map(row => ({
    ...row,
    roi: row.cost > 0 ? row.profit / row.cost : 0,
    cpa: row.ftds > 0 ? row.cost / row.ftds : 0,
    conversion_rate: row.clicks > 0 ? row.ftds / row.clicks : 0,
  })).sort((a, b) => b.profit - a.profit);

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

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
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.affiliate_id}</td>
                <td>{row.clicks.toLocaleString()}</td>
                <td>{row.ftds.toLocaleString()}</td>
                <td>{formatter.format(row.revenue)}</td>
                <td>{formatter.format(row.cost)}</td>
                <td style={{ color: row.profit >= 0 ? '#10b981' : '#ef4444' }}>{formatter.format(row.profit)}</td>
                <td style={{ color: row.roi >= 0 ? '#10b981' : '#ef4444' }}>{pctFormatter.format(row.roi)}</td>
                <td>{formatter.format(row.cpa)}</td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center' }}>No affiliate data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="chart-card" style={{ marginTop: '24px' }}>
        <div className="chart-title">Clicks vs Profit</div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="clicks" name="Total Clicks" stroke="#64748b" />
            <YAxis type="number" dataKey="profit" name="Profit" stroke="#64748b" tickFormatter={(val) => `$${val}`} />
            <ZAxis type="category" dataKey="affiliate_id" name="Affiliate" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }} />
            <Scatter name="Affiliates" data={tableData} fill="#0ea5e9" opacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
