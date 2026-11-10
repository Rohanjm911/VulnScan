import React from 'react';
import { useAnimation } from '../../context/AnimationContext';

interface BorderBeamProps {
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
  borderWidth?: number;
  className?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  colorFrom = '#C084FC',
  colorTo = '#E879F9',
  duration = 4,
  borderWidth = 1.5,
  className = '',
}) => {
  const { isNeon } = useAnimation();

  if (!isNeon) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden ${className}`}
      style={{ padding: borderWidth }}
    >
      {/* Revolving conic laser beam */}
      <div
        className="absolute -inset-[150%] animate-spin-slow opacity-90"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 315deg, ${colorTo} 350deg, transparent 360deg)`,
          animationDuration: `${duration}s`,
        }}
      />
    </div>
  );
};

