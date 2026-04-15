'use client';

import { useData }            from '@/components/DataProvider';
import { KPICard }            from '@/components/KPICard';
import { PerformanceChart }   from '@/components/charts/PerformanceChart';
import { CountryPieChart }    from '@/components/charts/CountryPieChart';
import { AffiliatesBarChart } from '@/components/charts/AffiliatesBarChart';
import { processKPIs }        from '@/utils/kpiEngine';

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
        <KPICard label="Revenue"  value={currFmt.format(kpis.revenue)}       color="#00d4ff" />
        <KPICard label="Cost"     value={currFmt.format(kpis.cost)}          color="#f59e0b" />
        <KPICard label="Profit"   value={currFmt.format(kpis.profit)}        color="#10b981" />
        <KPICard label="ROI"      value={pctFmt.format(kpis.roi)}            color="#7c3aed" />
        <KPICard label="FTDs"     value={kpis.ftds.toLocaleString()}         color="#ec4899" />
        <KPICard label="CPA"      value={currFmt.format(kpis.cpa)}           color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart data={timeData} />
        <CountryPieChart  data={countryData} />
      </div>

      <AffiliatesBarChart data={topAffiliates} />
    </div>
  );
}
