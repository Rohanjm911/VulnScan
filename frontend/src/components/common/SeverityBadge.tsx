import React from 'react';

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sev = severity.toUpperCase();

  const colorMap: Record<string, string> = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30 hover:border-red-500/60 shadow-glow-red',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:border-orange-500/60',
    MEDIUM: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-500/60',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/60',
    INFO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60',
  };

  const sizeMap: Record<string, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  };

  const classes = colorMap[sev] || 'bg-slate-800 text-slate-300 border-slate-700';
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase font-mono ${classes} ${sizeClass} transition-all`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {sev}
    </span>
  );
};

