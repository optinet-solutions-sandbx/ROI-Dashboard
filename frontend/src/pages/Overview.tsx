import React from 'react';
import { KPICard } from '../components/KPICard';
import { type PerformanceRecord, processKPIs } from '../utils/kpiEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const Overview: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const kpis = processKPIs(data);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const pctFormatter = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
  
  // Aggregate data for Time Series
  const timeMap: Record<string, { date: string, revenue: number, cost: number, profit: number }> = {};
  data.forEach(d => {
    if (!d.date) return;
    if (!timeMap[d.date]) timeMap[d.date] = { date: d.date, revenue: 0, cost: 0, profit: 0 };
    timeMap[d.date].revenue += Number(d.revenue) || 0;
    timeMap[d.date].cost += Number(d.cost) || 0;
    timeMap[d.date].profit += (Number(d.revenue) || 0) - (Number(d.cost) || 0);
  });
  const timeData = Object.values(timeMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate Data for Affiliates
  const affMap: Record<string, number> = {};
  data.forEach(d => {
    if (!d.affiliate_id) return;
    affMap[d.affiliate_id] = (affMap[d.affiliate_id] || 0) + ((Number(d.revenue) || 0) - (Number(d.cost) || 0));
  });
  const topAffiliates = Object.keys(affMap)
    .map(key => ({ affiliate_id: key, profit: affMap[key] }))
    .sort((a, b) => b.profit - a.profit).slice(0, 10);

  // Aggregate Data for Countries
  const countryMap: Record<string, number> = {};
  data.forEach(d => {
    if (!d.country) return;
    countryMap[d.country] = (countryMap[d.country] || 0) + (Number(d.revenue) || 0);
  });
  const countryData = Object.keys(countryMap).map(key => ({ name: key, value: countryMap[key] }));

  return (
    <div>
      <div className="header">
        <h1>Overview</h1>
        <p>Key Performance Indicators</p>
      </div>

      <div className="kpi-grid">
        <KPICard label="Revenue" value={formatter.format(kpis.revenue)} color="#00d4ff" />
        <KPICard label="Cost" value={formatter.format(kpis.cost)} color="#f59e0b" />
        <KPICard label="Profit" value={formatter.format(kpis.profit)} color="#10b981" />
        <KPICard label="ROI" value={pctFormatter.format(kpis.roi)} color="#7c3aed" />
        <KPICard label="FTDs" value={kpis.ftds.toLocaleString()} color="#ec4899" />
        <KPICard label="CPA" value={formatter.format(kpis.cpa)} color="#ef4444" />
      </div>

      <div className="chart-grid cols-2">
        <div className="chart-card">
          <div className="chart-title">Performance Over Time</div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
              <Area type="monotone" dataKey="revenue" stroke="#00d4ff" fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Revenue by Country</div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={countryData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                {countryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: '24px' }}>
        <div className="chart-title">Top 10 Affiliates by Profit</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topAffiliates} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" stroke="#64748b" />
            <YAxis type="category" dataKey="affiliate_id" stroke="#64748b" tick={{ fontSize: 12 }} width={100} />
            <Tooltip cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Bar dataKey="profit" fill="#00d4ff" radius={[0, 4, 4, 0]}>
              {topAffiliates.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#00d4ff' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
