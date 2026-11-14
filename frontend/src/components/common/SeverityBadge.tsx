import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sev = severity.toUpperCase();

  const colorMap: Record<string, string> = {
    CRITICAL: 'bg-red-950/40 text-red-400 border-red-800/60',
    HIGH: 'bg-orange-950/40 text-orange-400 border-orange-800/60',
    MEDIUM: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
    LOW: 'bg-blue-950/40 text-blue-400 border-blue-800/60',
    INFO: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
  };

  const sizeMap: Record<string, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-0.5',
    lg: 'text-sm font-semibold px-3 py-1',
  };

  const classes = colorMap[sev] || 'bg-slate-800 text-slate-300 border-slate-700';
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border tracking-wide uppercase font-mono ${classes} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {sev}
    </span>
  );
};
