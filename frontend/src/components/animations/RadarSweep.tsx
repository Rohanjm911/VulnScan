import React from 'react';
import { useAnimation } from '../../context/AnimationContext';

interface RadarSweepProps {
  size?: number;
  className?: string;
  color?: string;
  showBlips?: boolean;
}

export const RadarSweep: React.FC<RadarSweepProps> = ({
  size = 120,
  className = '',
  color = '#C084FC',
  showBlips = true,
}) => {
  const { isRadar } = useAnimation();

  if (!isRadar) return null;

  return (
    <div
      className={`relative pointer-events-none overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Concentric Grid Rings */}
      <div className="absolute inset-0 rounded-full border border-purple-500/20" />
      <div className="absolute inset-[25%] rounded-full border border-purple-500/15" />
      <div className="absolute inset-[50%] rounded-full border border-purple-500/10" />

      {/* Crosshair lines */}
      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-purple-500/20 -translate-y-1/2" />
      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-purple-500/20 -translate-x-1/2" />

      {/* Rotating Radar Beam Sweep */}
      <div
        className="absolute inset-0 rounded-full animate-spin-radar origin-center"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, rgba(192, 132, 252, 0.45) 0deg, rgba(232, 121, 249, 0.15) 30deg, transparent 65deg)`,
        }}
      />

      {/* Synthetic Radar Blips */}
      {showBlips && (
        <>
          <span
            className="absolute top-[30%] left-[65%] w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75"
            style={{ animationDuration: '2.5s' }}
          />
          <span
            className="absolute top-[68%] left-[25%] w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping opacity-60"
            style={{ animationDuration: '3.2s' }}
          />
        </>
      )}
    </div>
  );
};

