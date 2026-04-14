import React from 'react';
import { type PerformanceRecord, getInsights } from '../utils/kpiEngine';

export const Insights: React.FC<{ data: PerformanceRecord[] }> = ({ data }) => {
  const { top_affiliates, worst_affiliates, recommendations } = getInsights(data);

  return (
    <div>
      <div className="header">
        <h1>Insights</h1>
        <p>Automated Analysis & Recommendations</p>
      </div>

      <div className="chart-grid cols-2">
        <div className="chart-card" style={{ height: 'auto' }}>
          <div className="chart-title" style={{ color: '#00d4ff' }}>🏆 Top Performers</div>
          {top_affiliates.map((aff, idx) => (
            <div key={idx} className="insight-banner">
              <span style={{ color: '#00d4ff', fontWeight: 700 }}>#{idx + 1}</span> &nbsp;
              <strong>{aff}</strong>
            </div>
          ))}
          {top_affiliates.length === 0 && <p>Not enough data.</p>}
        </div>

        <div className="chart-card" style={{ height: 'auto' }}>
          <div className="chart-title" style={{ color: '#ef4444' }}>⚠️ Underperformers (Negative ROI)</div>
          {worst_affiliates.map((aff, idx) => (
            <div key={idx} className="insight-banner" style={{ borderLeftColor: '#ef4444' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>Action Needed</span> &nbsp;
              <strong>{aff}</strong>
            </div>
          ))}
          {worst_affiliates.length === 0 && <p style={{ color: '#10b981' }}>No underperforming affiliates detected.</p>}
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: '24px', height: 'auto' }}>
        <div className="chart-title">💡 Recommendations</div>
        {recommendations.map((rec, idx) => (
          <div key={idx} className="insight-banner" style={{ borderLeftColor: '#f59e0b', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <span style={{ color: '#f59e0b' }}>▸</span> {rec}
          </div>
        ))}
      </div>
    </div>
  );
};
