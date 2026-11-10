import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Radio, 
  Box, 
  Zap, 
  Shield, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation, AnimationStyle } from '../../context/AnimationContext';

export const AnimationSelector: React.FC = () => {
  const { style, setStyle } = useAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: Array<{
    id: AnimationStyle;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    color: string;
    badge: string;
  }> = [
    {
      id: 'neon',
      label: 'Neon Border Beam & Pulse',
      sublabel: 'Rotating neon laser perimeter & glowing ambient pulse',
      icon: Zap,
      color: 'text-fuchsia-400',
      badge: 'POPULAR',
    },
    {
      id: 'radar',
      label: 'Radar & Text Decrypt',
      sublabel: 'Active SOC radar sweep overlay & hacker cipher scramble',
      icon: Radio,
      color: 'text-purple-400',
      badge: 'SOC TECH',
    },
    {
      id: 'tilt',
      label: '3D Card Tilt & Mesh',
      sublabel: 'Interactive 3D mouse perspective with constellation particle mesh',
      icon: Box,
      color: 'text-sky-400',
      badge: 'SPATIAL',
    },
    {
      id: 'minimal',
      label: 'Stealth Minimal',
      sublabel: 'Clean static layout with zero animations',
      icon: Shield,
      color: 'text-slate-400',
      badge: 'STEALTH',
    },
  ];

  const currentOption = options.find((opt) => opt.id === style) || options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181033] border border-purple-500/40 hover:border-purple-400 text-slate-200 hover:text-white transition-all text-xs font-mono shadow-sm hover:shadow-glow-synth group"
        title="Switch Animation Style (Live Interactive Selector)"
      >
        <CurrentIcon className={`w-3.5 h-3.5 ${currentOption.color} animate-pulse`} />
        <span className="hidden lg:inline font-semibold">{currentOption.label.split(' ')[0]} FX</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#160E2E]/95 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-2xl p-3 z-50 space-y-2"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2E1E54] px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="font-bold text-white text-xs font-heading uppercase tracking-wider">
                  Live Motion & FX Selector
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.5 rounded">
                OPTION 5
              </span>
            </div>

            <p className="text-[11px] text-slate-400 px-1 pb-1">
              Choose your preferred visual experience. Changes take effect instantly across all dashboards and cards.
            </p>

            <div className="space-y-1.5">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = style === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStyle(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500 text-white shadow-glow-synth'
                        : 'bg-[#191136]/60 border-[#2E1E54] text-slate-300 hover:bg-[#201545] hover:border-purple-500/40'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isSelected ? 'bg-purple-600/30 text-fuchsia-300' : 'bg-[#120C24] text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs tracking-wide text-slate-100 flex items-center gap-1.5">
                          {opt.label}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {opt.sublabel}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="text-fuchsia-400 mt-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

