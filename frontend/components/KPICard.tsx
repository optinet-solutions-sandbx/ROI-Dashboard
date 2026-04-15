interface KPICardProps {
  label: string;
  value: string | number;
  color: string;
}

export function KPICard({ label, value, color }: KPICardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-5 text-center hover:-translate-y-0.5 transition-transform shadow-[0_4px_24px_rgba(0,212,255,0.05)]">
      <div className="text-xs text-[#94a3b8] uppercase tracking-widest mb-2 font-semibold">
        {label}
      </div>
      <div className="text-[1.8rem] font-bold leading-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
