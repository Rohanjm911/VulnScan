import React from 'react';

export type LogoVariant = 'sentinel' | 'radar' | 'apex' | 'matrix';

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'sentinel',
  size = 28,
  showText = false,
  className = '',
}) => {
  const renderIcon = () => {
    switch (variant) {
      case 'radar':
        // Radar Aperture / Cyber Target Node
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <circle cx="16" cy="16" r="14" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="10" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="16" cy="16" r="5" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
            {/* Crosshair ticks */}
            <line x1="16" y1="2" x2="16" y2="7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="25" x2="16" y2="30" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="16" x2="7" y2="16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="16" x2="30" y2="16" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            {/* Center target dot */}
            <circle cx="16" cy="16" r="2" fill="#60a5fa" />
          </svg>
        );

      case 'apex':
        // Apex Stealth Guard / Falcon Shield
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Outer Left Wing */}
            <path
              d="M16 3L4 9V17C4 23 9.5 28.5 16 30C22.5 28.5 28 23 28 17V9L16 3Z"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Inner Stealth V */}
            <path
              d="M16 7L8 11V16C8 20.5 11.5 24.5 16 26C20.5 24.5 24 20.5 24 16V11L16 7Z"
              fill="#1e293b"
            />
            <path
              d="M11 12L16 21L21 12H18L16 16.5L14 12H11Z"
              fill="#3b82f6"
            />
            <circle cx="16" cy="10" r="1.5" fill="#60a5fa" />
          </svg>
        );

      case 'matrix':
        // Code Chevrons & Defensive Bastion
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Shield Outline */}
            <path
              d="M16 2L27 6V15C27 22.5 22 28 16 30C10 28 5 22.5 5 15V6L16 2Z"
              fill="#111827"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Left Bracket < */}
            <path
              d="M13 10L8 15L13 20"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Bracket > */}
            <path
              d="M19 10L24 15L19 20"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Central Slashed Core */}
            <path
              d="M17 10L15 20"
              stroke="#60a5fa"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'sentinel':
      default:
        // Sentinel V-Shield (Geometric, Sharp, Flat)
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Hexagonal Shield Plate */}
            <path
              d="M16 2.5L28 7.5V16C28 23.5 22.8 28.2 16 30.5C9.2 28.2 4 23.5 4 16V7.5L16 2.5Z"
              fill="#111827"
              stroke="#2563eb"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            {/* Flat Inner Core */}
            <path
              d="M16 6L24 9.8V15.5C24 21 20.2 24.8 16 26.8C11.8 24.8 8 21 8 15.5V9.8L16 6Z"
              fill="#1e293b"
            />
            {/* Bold Sharp 'V' Emblem */}
            <path
              d="M11 11.5L16 21L21 11.5H18.2L16 16.2L13.8 11.5H11Z"
              fill="#3b82f6"
            />
            {/* Precision Radar Dot */}
            <circle cx="16" cy="10" r="1.5" fill="#93c5fd" />
          </svg>
        );
    }
  };

  if (!showText) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{renderIcon()}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderIcon()}
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-wide text-white font-heading">
          VULN<span className="text-blue-500">SCAN</span>
        </span>
        <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
          SecOps Platform
        </span>
      </div>
    </div>
  );
};

