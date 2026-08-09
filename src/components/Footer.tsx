import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-neutral-lightGray dark:bg-neutral-black
                       text-neutral-black dark:text-neutral-lightGray
                       border-t border-neutral-gray/50 dark:border-neutral-gray">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="font-bold text-neutral-black dark:text-neutral-white text-lg mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Skills', href: '#skills' },
                { label: 'Experience', href: '#experience' },
                { label: 'Projects', href: '#projects' },
                { label: 'Certifications', href: '#certifications' },
                { label: 'Contact', href: '#contact' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-neutral-black dark:text-neutral-lightGray
                           hover:text-primary-pink transition-colors group"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-2" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-neutral-black dark:text-neutral-white text-lg mb-4">Connect With Me</h3>
            <div className="flex gap-6">
              <a
                href="https://github.com/Fziyen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-black dark:text-neutral-lightGray hover:text-primary-pink transition-colors hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/fziyen/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-black dark:text-neutral-lightGray hover:text-primary-pink transition-colors hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:LenaFziyen@gmail.com"
                className="text-neutral-black dark:text-neutral-lightGray hover:text-primary-pink transition-colors hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-gray/50 dark:border-neutral-gray pt-8 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Lena Fziyen. Built with React, TypeScript & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
};
