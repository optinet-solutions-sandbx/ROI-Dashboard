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
