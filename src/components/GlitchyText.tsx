import { useState, useEffect } from "react";

interface GlitchyTextProps {
  text: string;
  className?: string;
  glitchIntensity?: number;
  enabled?: boolean;
}

const generateGlitch = (text: string, intensity: number) => {
  const chars = "!@#$%_+-=[]{}<>?";
  return [...text].map(char => char !== " " && Math.random() < intensity
    ? chars[Math.floor(Math.random() * chars.length)] : char).join("");
};

export const GlitchyText = ({
  text, className = "", glitchIntensity = 0.08, enabled = true,
}: GlitchyTextProps) => {
  const [glitchedText, setGlitchedText] = useState(text);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const animate = enabled && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setGlitchedText(text);
    if (!animate) return;
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const burst = () => {
      if (cancelled) return;
      setGlitchedText(generateGlitch(text, glitchIntensity));
      timeout = setTimeout(() => {
        setGlitchedText(text);
        timeout = setTimeout(burst, 3400 + Math.random() * 1600);
      }, 130);
    };
    timeout = setTimeout(burst, 1600);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [text, glitchIntensity, animate]);

  return (
    <span className={`glitch-text ${animate ? "glitch-running" : ""} ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="glitch-visual" data-text={text} aria-hidden="true">
        {animate ? glitchedText : text}
      </span>
    </span>
  );
};
