import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { heroData } from '../data';

export const StickyResumeButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero');

    const handleScroll = () => {
      if (!hero) return;
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      setVisible(window.scrollY > heroBottom - 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href={heroData.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Resume"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3
                  bg-gradient-to-r from-primary-pink to-primary-purple
                  text-white font-semibold rounded-full shadow-lg
                  hover:shadow-xl hover:shadow-primary-pink/40
                  transition-all duration-500 hover:scale-105
                  ${visible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-8 pointer-events-none'}`}
    >
      <Download className="w-5 h-5" />
      <span className="hidden sm:inline">Resume</span>
    </a>
  );
};
