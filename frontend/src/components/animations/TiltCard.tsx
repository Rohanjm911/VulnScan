import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
  enableGlare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTilt = 7,
  className = '',
  enableGlare = true,
  ...props
}) => {
  const { isTilt } = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);

  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;

    x.set(mouseX);
    y.set(mouseY);

    if (enableGlare) {
      setGlarePos({
        x: mouseX * 100,
        y: mouseY * 100,
        opacity: 0.18,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isTilt) return;
    x.set(0.5);
    y.set(0.5);
    if (enableGlare) {
      setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  if (!isTilt) {
    return (
      <div className={`cyber-card relative ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`cyber-card relative transition-shadow duration-300 ${className}`}
        {...(props as any)}
      >
        {children}

        {/* Dynamic 3D Glare effect */}
        {enableGlare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, rgba(192, 132, 252, 0.4), transparent 80%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

