import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  color: string;
  icon:  React.ReactNode;
  sub?:  string; // optional sub-label (e.g. "vs last period")
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, color, icon, sub }) => (
  <div
    className="kpi-card"
    style={{
      '--kpi-color': color,
      '--kpi-bg':    `${color}1a`,
    } as React.CSSProperties}
  >
    <div className="kpi-card__top">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__icon">{icon}</div>
    </div>
    <div className="kpi-card__value">{value}</div>
    {sub && <div className="kpi-card__sub">{sub}</div>}
  </div>
);
