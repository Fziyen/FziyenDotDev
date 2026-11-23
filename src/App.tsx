import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Pause,
  Play,
  X,
} from "lucide-react";
import {
  contactData,
  heroData,
} from "./data";
import { ProjectShowcase } from "./components/ProjectShowcase";
import { Contact } from "./components/Contact";
import { useJourneyMotion } from "./hooks/useJourneyMotion";
import { Chapter } from "./components/Chapter";
import { Journey } from "./components/Journey";
import { Credentials } from "./components/Credentials";
import { Skills } from "./components/Skills";
import { GlitchyText } from "./components/GlitchyText";
import { RotatingTypewriter } from "./components/RotatingTypewriter";

import { dismissStartupLoader } from "./startupLoader";

const Terrain = lazy(() => import("./components/terrain/Terrain"));
// Scroll distance per chapter, as a fraction of the viewport height.
const SCROLL_STEP = 0.3;
const chapters = [
  { id: "home", label: "Intro" },
  { id: "skills", label: "Toolkit" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Journey" },
  { id: "certifications", label: "Credentials" },
  { id: "contact", label: "Contact" },
];
const chapterFromHash = () => {
  const hash = window.location.hash.slice(1);
  return Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === hash),
  );
};

function App() {
  const [chapter, setChapter] = useState(chapterFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const travel = useRef(chapter);
  const stage = useRef<HTMLElement>(null);
  const journey = useJourneyMotion(travel, stage, paused, setChapter);
  const progressBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal usable content even if the decorative terrain is slow to load.
    const timeout = window.setTimeout(dismissStartupLoader, 4000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPaused(media.matches);
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const getStep = () => window.innerHeight * SCROLL_STEP;
    const onScroll = () => {
      const position = Math.min(
        chapters.length - 1,
        Math.max(0, window.scrollY / getStep() || 0),
      );
      travel.current = position;
      const index = Math.round(position);
      if (progressBar.current)
        progressBar.current.style.transform = `scaleX(${position / (chapters.length - 1)})`;
      const hash = `#${chapters[index].id}`;
      if (window.location.hash !== hash)
        window.history.replaceState(null, "", hash);
    };
    const onHash = () =>
      window.scrollTo({
        top: chapterFromHash() * getStep(),
        behavior: "instant",
      });
    const onResize = () =>
      window.scrollTo({
        top: Math.round(travel.current) * getStep(),
        behavior: "instant",
      });
    onHash();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const navigate = (index: number) => {
    setMenuOpen(false);
    window.scrollTo({
      top: index * window.innerHeight * SCROLL_STEP,
      behavior: "instant",
    });
    travel.current = index;
  };

  // Left/right arrow keys step between chapters, except while typing or
  // when a focused control (e.g. a carousel) has already handled the key.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
      const current = Math.round(travel.current);
      const next = Math.max(0, Math.min(chapters.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
      if (next === current) return;
      event.preventDefault();
      setMenuOpen(false);
      window.scrollTo({ top: next * window.innerHeight * SCROLL_STEP, behavior: "instant" });
      travel.current = next;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`portfolio ${paused ? "motion-paused" : ""}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <Suspense fallback={<div className="terrain terrain-fallback" />}>
        <Terrain journey={journey} paused={paused} />
      </Suspense>
      <div className="scene-shade" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <header className="site-header">
        <a
          className="wordmark"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate(0);
          }}
          aria-label="Fziyen home"
        >
          <span className="brand-symbol">f/</span> fziyen
          <span className="wordmark-dot">.</span>
          <span className="wordmark-dev">dev</span>
        </a>
        <nav
          id="main-navigation"
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          {chapters.map((item, index) => (
            <button
              key={item.id}
              aria-current={chapter === index ? "page" : undefined}
              onClick={() => navigate(index)}
            >
              <span className="nav-number">0{index + 1}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <a className="header-contact" href={contactData.socialLinks.email}>
          Let’s talk <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        >
          {menuOpen ? (
            <X size={22} />
          ) : (
            <span>
              Menu <span>+</span>
            </span>
          )}
        </button>
      </header>

      <aside className="side-coordinate" aria-hidden="true">
        PORTFOLIO / LENA FZIYEN
      </aside>
      <main
        ref={stage}
        id="main-content"
        tabIndex={-1}
        className={`viewport-content chapter-${chapter}`}
      >
        <Chapter
          index={0}
          active={chapter === 0}
          className="hero-chapter"
          aria-labelledby="intro-title"
        >
          {/* On wide screens the 3D tag at the cathedral says this, so this
              line is only read out; on phones it shows as a location chip. */}
          <p className="hero-location">
            <span className="hero-location-pin" aria-hidden="true" />
            Based in Helsinki<span className="hero-location-country">, Finland</span>
            <span className="hero-location-coords" aria-hidden="true">60.17°N 24.95°E</span>
          </p>
          <h1 id="intro-title">
            <GlitchyText text={`Hey, I'm ${heroData.name}`} enabled={chapter === 0 && !paused} />
          </h1>
          <div className="hero-role">
            <RotatingTypewriter phrases={heroData.phrases} speed={80} delayBetweenPhrases={2500} enabled={chapter === 0 && !paused} />
          </div>
          <div className="hero-bottom">
            <div className="hero-copy">
              <p>{heroData.tagline}</p>
            </div>
            <div className="hero-actions">
              <button
                className="button button-primary"
                onClick={() => navigate(2)}
              >
                View My Work <ArrowUpRight size={18} />
              </button>
              <button className="text-link" onClick={() => navigate(5)}>
                Get in Touch <ArrowUpRight size={15} />
              </button>
              <a
                className="text-link"
                href={heroData.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download Resume <Download size={15} />
              </a>
            </div>
          </div>
        </Chapter>

        <Chapter
          index={1}
          active={chapter === 1}
          aria-labelledby="skills-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / TOOLKIT</p>
              <h2 id="skills-title">
                <GlitchyText text="Skills & Technologies" enabled={chapter === 1 && !paused} />
              </h2>
            </div>
          </div>
          <Skills paused={paused} />
        </Chapter>

        <Chapter
          index={2}
          active={chapter === 2}
          className="work-chapter"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / PROJECTS</p>
              <h2 id="work-title">
                <GlitchyText text="Featured Projects" enabled={chapter === 2 && !paused} />
              </h2>
            </div>
          </div>
          <ProjectShowcase paused={paused} />
        </Chapter>

        <Chapter
          index={3}
          active={chapter === 3}
          className="journey-chapter"
          aria-labelledby="journey-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">04 / EXPERIENCE</p>
              <h2 id="journey-title">
                <GlitchyText text="Experience & Education" enabled={chapter === 3 && !paused} />
              </h2>
            </div>
            <a
              className="text-link"
              href={heroData.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Full résumé <Download size={16} />
            </a>
          </div>
          <Journey paused={paused} />
        </Chapter>

        <Chapter
          index={4}
          active={chapter === 4}
          className="creds-chapter"
          aria-labelledby="credentials-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">05 / CERTIFICATIONS</p>
              <h2 id="credentials-title">
                <GlitchyText text="Certifications & Credentials" enabled={chapter === 4 && !paused} />
              </h2>
            </div>
          </div>
          <Credentials paused={paused} />
        </Chapter>

        <Chapter
          index={5}
          active={chapter === 5}
          aria-label="Contact Lena"
        >
          <Contact animate={chapter === 5 && !paused} />
          <p className="contact-copyright">
            © {new Date().getFullYear()} Lena Fziyen{" "}
            <span>Built with React, TypeScript & Three.js.</span>
          </p>
        </Chapter>
      </main>

      <div className="right-rail" aria-label="Chapter navigation">
        {chapters.map((item, index) => (
          <button
            key={item.id}
            onClick={() => navigate(index)}
            aria-label={`Go to ${item.label}`}
            aria-current={chapter === index ? "step" : undefined}
          >
            <span>{item.label}</span>
            <i />
          </button>
        ))}
      </div>
      <footer className="flight-deck">
        <div className="flight-progress" ref={progressBar} />
        <div className="flight-location">
          <span className="flight-index">
            0{chapter + 1}
            <span> / 06</span>
          </span>
          <span className="flight-label">
            {chapters[chapter].label}
          </span>
        </div>
        <div className="scroll-prompt">
          <span className="scroll-icon">
            <ArrowDown size={13} />
          </span>
          <span>
            SCROLL TO EXPLORE
          </span>
        </div>
        <div className="flight-controls">
          <button
            className="motion-control"
            onClick={() => setPaused(!paused)}
            aria-label={
              paused ? "Play terrain animation" : "Pause terrain animation"
            }
            aria-pressed={paused}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
            <span>{paused ? "MOTION OFF" : "MOTION ON"}</span>
          </button>
          <span className="control-divider" />
          <button
            className="icon-button"
            disabled={chapter === 0}
            onClick={() => navigate(chapter - 1)}
            aria-label="Previous chapter"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="icon-button"
            disabled={chapter === chapters.length - 1}
            onClick={() => navigate(chapter + 1)}
            aria-label="Next chapter"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </footer>
      <span className="sr-only" role="status" aria-live="polite">
        Chapter {chapter + 1} of 6: {chapters[chapter].label}
      </span>
      <div
        className="scroll-distance"
        aria-hidden="true"
        style={{ height: `${100 + (chapters.length - 1) * SCROLL_STEP * 100}vh` }}
      />
    </div>
  );
}

export default App;
