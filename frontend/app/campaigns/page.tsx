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
