import { useState, useEffect } from 'react';

interface RotatingTypewriterProps {
  phrases: string[];
  speed?: number;
  delayBetweenPhrases?: number;
  className?: string;
}

export const RotatingTypewriter = ({
  phrases,
  speed = 80,
  delayBetweenPhrases = 2000,
  className = '',
}: RotatingTypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentPhrase.length) {
      timeout = setTimeout(() => {
        setDisplayText(prev => prev + currentPhrase[charIndex]);
        setCharIndex(prev => prev + 1);
      }, speed);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
        setCharIndex(prev => prev - 1);
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
  }, [charIndex, isDeleting, currentPhrase, speed, delayBetweenPhrases, phrases]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse ml-1">|</span>
    </span>
  );
};
