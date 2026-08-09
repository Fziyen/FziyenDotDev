import { AnimatedBackground } from './AnimatedBackground';
import { ArrowRight, Download } from 'lucide-react';
import { RotatingTypewriter } from './RotatingTypewriter';
import { CursorGlow } from './CursorGlow';
import { GlitchyText } from './GlitchyText';
import { heroData } from '../data';

export const Hero = () => {
  return (
    <CursorGlow>
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center px-6 py-20
                   bg-neutral-white dark:bg-neutral-black overflow-hidden pt-20"
      >
        <AnimatedBackground />

        <div className="relative z-10 max-w-5xl w-full">
          <div className="animate-slideIn">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4
                           text-neutral-black dark:text-neutral-white leading-tight">
              <GlitchyText text={`Hey, I'm ${heroData.name}`} glitchIntensity={0.05} />
            </h1>

            <div className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-8 h-16
                            bg-gradient-to-r from-primary-pink to-primary-purple bg-clip-text text-transparent">
              <RotatingTypewriter
                phrases={heroData.phrases}
                speed={80}
                delayBetweenPhrases={2500}
              />
            </div>

            <p className="text-lg text-neutral-black dark:text-neutral-lightGray mb-8 max-w-2xl leading-relaxed">
              {heroData.tagline}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-6 py-3
                           border-2 border-neutral-black dark:border-neutral-white
                           text-neutral-black dark:text-neutral-white font-semibold
                           rounded-lg hover:bg-neutral-black hover:text-neutral-white
                           dark:hover:bg-neutral-white dark:hover:text-neutral-black
                           transition-all duration-300"
              >
                View My Work
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3
                           border-2 border-neutral-black dark:border-neutral-white
                           text-neutral-black dark:text-neutral-white font-semibold
                           rounded-lg hover:bg-neutral-black hover:text-neutral-white
                           dark:hover:bg-neutral-white dark:hover:text-neutral-black
                           transition-all duration-300"
              >
                Get in Touch
              </a>
              <a
                href={heroData.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3
                           bg-gradient-to-r from-primary-purple to-primary-pink
                           text-white font-semibold rounded-lg
                           hover:shadow-lg hover:shadow-primary-purple/40
                           transition-all duration-300 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </section>
    </CursorGlow>
  );
};
