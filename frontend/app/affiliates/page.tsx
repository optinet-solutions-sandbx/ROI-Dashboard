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
