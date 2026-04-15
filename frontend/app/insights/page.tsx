'use client';

import { useData }     from '@/components/DataProvider';
import { getInsights } from '@/utils/kpiEngine';

export default function InsightsPage() {
  const { data } = useData();
  const { top_affiliates, worst_affiliates, recommendations } = getInsights(data);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Insights</h1>
        <p className="text-[#94a3b8]">Automated Analysis & Recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5">
          <p className="text-base font-semibold mb-4 text-[#00d4ff]">🏆 Top Performers</p>
          {top_affiliates.map((aff, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#1e3a5f]/60 to-[#0f172a]/60 border-l-[3px] border-[#00d4ff] rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
            >
              <span className="text-[#00d4ff] font-bold">#{idx + 1}</span>{' '}
              <strong>{aff}</strong>
            </div>
          ))}
          {top_affiliates.length === 0 && <p className="text-[#94a3b8]">Not enough data.</p>}
        </div>

        <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5">
          <p className="text-base font-semibold mb-4 text-[#ef4444]">⚠️ Underperformers (Negative ROI)</p>
          {worst_affiliates.map((aff, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-[#1e3a5f]/60 to-[#0f172a]/60 border-l-[3px] border-[#ef4444] rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
            >
              <span className="text-[#ef4444] font-bold">Action Needed</span>{' '}
              <strong>{aff}</strong>
            </div>
          ))}
          {worst_affiliates.length === 0 && (
            <p className="text-[#10b981]">No underperforming affiliates detected.</p>
          )}
        </div>
      </div>

      <div className="bg-[#0d1427] border border-[#1e293b] rounded-xl p-5 mt-6">
        <p className="text-base font-semibold mb-4 text-[#e2e8f0]">💡 Recommendations</p>
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-[#f59e0b]/10 to-[#0f172a]/60 border-l-[3px] border-[#f59e0b] rounded-md px-4 py-3 mb-3 text-[#cbd5e1] text-sm"
          >
            <span className="text-[#f59e0b]">▸</span> {rec}
          </div>
        ))}
      </div>
    </div>
  );
}
