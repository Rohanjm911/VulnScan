import React, { useState, useEffect, useRef } from 'react';
import { useAnimation } from '../../context/AnimationContext';

interface DecryptedTextProps {
  text: string | number;
  speed?: number;
  maxIterations?: number;
  className?: string;
  animateOnHover?: boolean;
}

const CIPHER_CHARS = '0123456789ABCDEF$#%&*<>[]{}~!=+?';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 35,
  maxIterations = 10,
  className = '',
  animateOnHover = true,
}) => {
  const { isRadar } = useAnimation();
  const targetText = String(text);
  const [displayText, setDisplayText] = useState<string>(targetText);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const intervalRef = useRef<any>(null);

  const startDecryptAnimation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsScrambling(true);

    let iteration = 0;
    const totalChars = targetText.length;

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return targetText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '/' || char === '.') return char;
            if (index < Math.floor(iteration / 2)) {
              return targetText[index];
            }
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join('');
      });

      iteration += 1;

      if (iteration >= totalChars * 2 + maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(targetText);
        setIsScrambling(false);
      }
    }, speed);
  };

  // Run scramble when radar mode is active or when target text changes
  useEffect(() => {
    if (isRadar) {
      startDecryptAnimation();
    } else {
      setDisplayText(targetText);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetText, isRadar]);

  return (
    <span
      className={`inline-block font-mono select-none ${className} ${
        isScrambling ? 'text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : ''
      }`}
      onMouseEnter={() => {
        if (animateOnHover) startDecryptAnimation();
      }}
      title="Decrypted SecOps telemetry"
    >
      {displayText}
    </span>
  );
};

