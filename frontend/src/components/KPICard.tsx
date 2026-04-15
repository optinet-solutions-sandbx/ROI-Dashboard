import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  color: string;
  icon:  React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, color, icon }) => (
  <div
    className="kpi-card"
    style={{
      '--kpi-color': color,
      '--kpi-bg':    `${color}1a`,   /* ~10 % opacity hex alpha */
    } as React.CSSProperties}
  >
    <div className="kpi-card__top">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__icon">{icon}</div>
    </div>
    <div className="kpi-card__value">{value}</div>
  </div>
);
