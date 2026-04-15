'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  affiliate_id: string;
  profit: number;
}

export function AffiliatesBarChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 mt-6">
      <p className="text-base font-semibold mb-4 text-[#e2e8f0]">Top 10 Affiliates by Profit</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <XAxis type="number" stroke="#64748b" />
          <YAxis
            type="category"
            dataKey="affiliate_id"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip
            cursor={{ fill: 'rgba(30,41,59,0.5)' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
          />
          <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.profit > 0 ? '#00d4ff' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
