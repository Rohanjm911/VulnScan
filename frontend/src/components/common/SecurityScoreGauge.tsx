import React from 'react';

interface SecurityScoreGaugeProps {
  score: number;
  size?: number;
  showRating?: boolean;
}

export const SecurityScoreGauge: React.FC<SecurityScoreGaugeProps> = ({ 
  score, 
  size = 84, 
  showRating = true 
}) => {
  const strokeWidth = Math.max(5, Math.round(size * 0.09));
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let strokeColor = '#10B981'; // Cyber Green
  let textColor = 'text-emerald-400';
  let rating = 'EXCELLENT';

  if (score < 40) {
    strokeColor = '#EF4444'; // Red
    textColor = 'text-red-400';
    rating = 'CRITICAL';
  } else if (score < 65) {
    strokeColor = '#F97316'; // Orange
    textColor = 'text-orange-400';
    rating = 'HIGH RISK';
  } else if (score < 85) {
    strokeColor = '#FBBF24'; // Amber
    textColor = 'text-amber-400';
    rating = 'MODERATE';
  }

  // Adaptive font sizing for clean, perfectly centered score with zero overlap
  const fontSizeClass = size <= 80 ? 'text-lg' : size <= 100 ? 'text-xl' : 'text-3xl';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Clean, perfectly centered score */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`${fontSizeClass} font-black font-heading tracking-tight leading-none ${textColor}`}>
            {score}
          </span>
        </div>
      </div>

      {showRating && (
        <span className={`mt-1.5 text-[10px] font-mono font-bold tracking-wider uppercase ${textColor}`}>
          {rating}
        </span>
      )}
    </div>
  );
};
