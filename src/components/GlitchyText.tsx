import { useState, useEffect } from 'react';

interface GlitchyTextProps {
  text: string;
  className?: string;
  glitchIntensity?: number;
}

const generateGlitch = (text: string, intensity: number) => {
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  return text
    .split('')
    .map((char) => {
      if (Math.random() < intensity) {
        return chars[Math.floor(Math.random() * chars.length)];
      }
      return char;
    })
    .join('');
};

export const GlitchyText = ({ text, className = '', glitchIntensity = 0.1 }: GlitchyTextProps) => {
  const [glitchedText, setGlitchedText] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setGlitchedText(generateGlitch(text, glitchIntensity));
      } else {
        setGlitchedText(text);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [text, glitchIntensity]);

  return (
    <span
      className={`relative ${className}`}
      style={{
        textShadow: `
          -2px 0 #FF10F0,
          2px 0 #9D4EDD,
          0 -2px #FF10F0,
          0 2px #9D4EDD
        `,
      }}
    >
      {glitchedText}
    </span>
  );
};
