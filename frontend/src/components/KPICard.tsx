import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  color: string;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, color }) => (
  <div className="kpi-card">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value" style={{ color }}>{value}</div>
  </div>
);
