import React, { createContext, useContext, useState, useEffect } from 'react';

export type AnimationStyle = 'neon' | 'radar' | 'tilt' | 'minimal';

interface AnimationContextType {
  style: AnimationStyle;
  setStyle: (style: AnimationStyle) => void;
  isNeon: boolean;
  isRadar: boolean;
  isTilt: boolean;
  isMinimal: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

const STORAGE_KEY = 'vulnscan_anim_style';

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [style, setStyleState] = useState<AnimationStyle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['neon', 'radar', 'tilt', 'minimal'].includes(saved)) {
        return saved as AnimationStyle;
      }
    } catch (e) {
      // Fallback
    }
    return 'neon'; // Default to Neon Border Beam & Pulse
  });

  const setStyle = (newStyle: AnimationStyle) => {
    setStyleState(newStyle);
    try {
      localStorage.setItem(STORAGE_KEY, newStyle);
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  const isNeon = style === 'neon';
  const isRadar = style === 'radar';
  const isTilt = style === 'tilt';
  const isMinimal = style === 'minimal';

  return (
    <AnimationContext.Provider
      value={{
        style,
        setStyle,
        isNeon,
        isRadar,
        isTilt,
        isMinimal,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

