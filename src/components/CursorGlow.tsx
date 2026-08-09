import { useEffect, useState, useRef } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export const CursorGlow = ({ children }: { children: React.ReactNode }) => {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          setPosition({ x, y });
          setIsVisible(true);
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {isVisible && (
        <>
          <div
            className="pointer-events-none fixed w-96 h-96 bg-gradient-to-r from-primary-pink/30 to-primary-purple/30
                       rounded-full blur-3xl transition-opacity duration-300"
            style={{
              left: `${position.x - 192}px`,
              top: `${position.y - 192}px`,
              opacity: isVisible ? 1 : 0,
            }}
          />
          <div
            className="pointer-events-none fixed w-48 h-48 bg-primary-pink/20 rounded-full blur-2xl transition-opacity duration-300"
            style={{
              left: `${position.x - 96}px`,
              top: `${position.y - 96}px`,
              opacity: isVisible ? 1 : 0,
            }}
          />
        </>
      )}
      {children}
    </div>
  );
};
