import { Menu, X, Code2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const hero = document.getElementById('hero');
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;

      if (currentScrollY < heroBottom) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > heroBottom) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Skills', href: '#skills' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 bg-neutral-white dark:bg-neutral-black/95
                  backdrop-blur-sm border-b border-neutral-lightGray dark:border-neutral-gray
                  transition-transform duration-300
                  ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary-pink" />
            <span className="font-bold text-lg hidden sm:inline text-neutral-black dark:text-neutral-white">
              Lena Fziyen
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-neutral-black dark:text-neutral-white hover:text-primary-pink
                          dark:hover:text-primary-pink transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 bg-primary-purple dark:bg-primary-pink
                         border-2 border-neutral-black dark:border-neutral-white
                         shadow-lg hover:shadow-primary-purple/40 dark:hover:shadow-primary-pink/40
                         transition-all duration-300 hover:translate-x-1 hover:translate-y-1
                         active:translate-x-0 active:translate-y-0 rounded-lg"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-white" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-black" />
              )}
            </button>

            <button
              className="md:hidden text-neutral-black dark:text-neutral-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-neutral-black dark:text-neutral-white hover:text-primary-pink
                          transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
