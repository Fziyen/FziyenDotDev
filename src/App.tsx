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
  certificationsData,
  contactData,
  experienceEducationData,
  heroData,
  skillsData,
} from "./data";
import { ProjectShowcase } from "./components/ProjectShowcase";
import { Contact } from "./components/Contact";
import { useJourneyMotion } from "./hooks/useJourneyMotion";
import { Chapter } from "./components/Chapter";
import { GlitchyText } from "./components/GlitchyText";
import { RotatingTypewriter } from "./components/RotatingTypewriter";

import { dismissStartupLoader } from "./startupLoader";

const Terrain = lazy(() => import("./components/terrain/Terrain"));
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
    const getStep = () => window.innerHeight * 1.25;
    const onScroll = () => {
      const position = Math.min(
        chapters.length - 1,
        Math.max(0, window.scrollY / getStep()),
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
      top: index * window.innerHeight * 1.25,
      behavior: "instant",
    });
    travel.current = index;
  };

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
          <div className="skills-grid">
            {skillsData.map((category) => (
              <article className="skill-card glass-panel" key={category.title}>
                <div className="skill-top">
                  <category.icon size={24} strokeWidth={1.3} />
                </div>
                <h3>{category.title}</h3>
                <ul className="skill-items" role="list">
                  {category.items.map((item) => (
                    <li key={item.name}>
                      <item.icon size={17} strokeWidth={1.6} aria-hidden="true" />
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
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
          <div className="journey-grid">
            {(["work", "education"] as const).map((group) => (
              <div className="journey-column" key={group}>
                <h3 className="eyebrow">
                  {group === "work" ? "01 — EXPERIENCE" : "02 — EDUCATION"}
                </h3>
                {experienceEducationData[group].map((item) => (
                  <article className="timeline-item" key={item.title}>
                    <span className="timeline-dot" />
                    <p className="timeline-period">
                      {item.period.replace("->", "—")}
                    </p>
                    <div className="timeline-heading">
                      {item.logoUrl && (
                        item.logoLink ? (
                          <a
                            className="timeline-logo"
                            href={item.logoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${item.company} website`}
                          >
                            <img src={item.logoUrl} alt={`${item.company} logo`} loading="lazy" />
                          </a>
                        ) : (
                          <span className="timeline-logo">
                            <img src={item.logoUrl} alt={`${item.company} logo`} loading="lazy" />
                          </span>
                        )
                      )}
                      <div className="timeline-heading-text">
                        <h3>{item.title}</h3>
                        <p className="timeline-company">{item.company}</p>
                      </div>
                    </div>
                    {Array.isArray(item.description) ? (
                      <ul>
                        {item.description.map((description) => (
                          <li key={description}>{description}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="timeline-description">{item.description}</p>
                    )}
                    {item.gpa && <span className="gpa">{item.gpa}</span>}
                  </article>
                ))}
              </div>
            ))}
          </div>
        </Chapter>

        <Chapter
          index={4}
          active={chapter === 4}
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
          <div className="credential-list">
            {certificationsData.map((item, index) => (
              <article className="credential" key={item.title}>
                <span className="credential-number">0{index + 1}</span>
                <div className="credential-icon">
                  <img
                    src={item.iconUrl}
                    alt={`${item.issuer} certification logo`}
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="credential-info">
                  <p>{item.issuer}</p>
                  <h3>{item.title}</h3>
                </div>
                <span className="credential-date">{item.date}</span>
                {item.credentialUrl !== "#" ? (
                  <a
                    className="icon-button"
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${item.title} credential`}
                  >
                    <ArrowUpRight size={21} />
                  </a>
                ) : (
                  <span className="credential-complete">COMPLETED</span>
                )}
              </article>
            ))}
          </div>
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
      <div className="scroll-distance" aria-hidden="true" />
    </div>
  );
}

export default App;
