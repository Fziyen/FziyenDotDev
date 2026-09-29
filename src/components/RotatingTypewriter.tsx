import { useState, useEffect } from "react";

interface RotatingTypewriterProps {
  phrases: string[];
  speed?: number;
  delayBetweenPhrases?: number;
  className?: string;
  enabled?: boolean;
}

export const RotatingTypewriter = ({
  phrases,
  speed = 160,
  delayBetweenPhrases = 2000,
  className = "",
  enabled = true,
}: RotatingTypewriterProps) => {
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    if (!enabled) return;
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentPhrase[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, speed);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, speed / 2);
    } else if (!isDeleting && charIndex === currentPhrase.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenPhrases);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [
    enabled,
    charIndex,
    isDeleting,
    currentPhrase,
    speed,
    delayBetweenPhrases,
    phrases,
  ]);

  return (
    <span className={className}>
      <span className="sr-only">{phrases.join(". ")}</span>
      <span aria-hidden="true">{enabled ? displayText : currentPhrase}<span className="type-cursor">|</span></span>
    </span>
  );
};
