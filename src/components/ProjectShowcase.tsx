import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Github, Radio } from "lucide-react";
import { projectsData, type Project } from "../data";

const titleOf = (project: Project) => project.title.replace(/\s*\(\s*Coming soon\.\.\.\)/i, "");
const numberOf = (index: number) => String(index + 1).padStart(2, "0");
const hasDemo = (project: Project) => Boolean(project.liveUrl && project.liveUrl !== "#");
const hostOf = (url: string) => {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return url;
  }
};

function Preview({ project, thumbnail = false }: { project: Project; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`work-preview ${thumbnail ? "work-preview-small" : ""}`}>
      {project.screenshotUrl && !failed ? (
        <img src={project.screenshotUrl} alt={thumbnail ? "" : `${titleOf(project)} preview`} loading={thumbnail ? "lazy" : "eager"} onError={() => setFailed(true)} />
      ) : (
        <div className="work-preview-empty"><Code2 aria-hidden="true" /><span>{titleOf(project)}</span></div>
      )}
    </div>
  );
}

export function ProjectShowcase({ paused }: { paused: boolean }) {
  const [selected, setSelected] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const project = projectsData[selected];

  // Keep the selected thumbnail visible when the strip scrolls sideways
  // (phones). Only the strip scrolls: scrollIntoView would also scroll the
  // window, which moves the journey to another chapter.
  useEffect(() => {
    const container = strip.current;
    const thumb = container?.children[selected] as HTMLElement | undefined;
    if (!container || !thumb || container.scrollWidth <= container.clientWidth) return;
    const left = thumb.offsetLeft;
    const right = left + thumb.offsetWidth;
    // Scroll to the thumbnail's own start (a scroll-snap point), so snapping
    // never pulls the strip back to a different item.
    if (left < container.scrollLeft || right > container.scrollLeft + container.clientWidth)
      container.scrollTo({ left, behavior: "smooth" });
  }, [selected]);

  if (!project) return null;
  const comingSoon = /coming soon/i.test(project.title);
  const live = hasDemo(project);
  const isProfile = /^https:\/\/github\.com\/[^/]+\/?$/i.test(project.githubUrl);
  const total = String(projectsData.length).padStart(2, "0");
  const choose = (direction: number) => setSelected(index => (index + direction + projectsData.length) % projectsData.length);
  const status = comingSoon ? "In development" : project.featured ? "Featured project" : "Selected work";

  return (
    <div className="work-showcase" data-paused={paused}>
      <article className="work-feature" id="selected-work" aria-label={titleOf(project)}>
        {/* A 16:9 holographic screen: the image fills it edge to edge. */}
        <div className="work-screen" key={project.title}>
          <Preview project={project} />
          <div className="work-screen-hud" aria-hidden="true">
            <span className={`work-signal ${live ? "is-live" : ""}`}>
              <i />{live ? hostOf(project.liveUrl) : comingSoon ? "in development" : "preview"}
            </span>
            <span>{numberOf(selected)} / {total}</span>
          </div>
          <span className="work-screen-scan" aria-hidden="true" />
          <span className="work-corner work-corner-tl" aria-hidden="true" />
          <span className="work-corner work-corner-tr" aria-hidden="true" />
          <span className="work-corner work-corner-bl" aria-hidden="true" />
          <span className="work-corner work-corner-br" aria-hidden="true" />
        </div>
        <div className="work-info" key={`info-${project.title}`}>
          <p className="work-status">
            <span className="work-status-dot" />
            <span>{status}</span>
            <span className="work-status-index">/ {numberOf(selected)}</span>
          </p>
          <h3>{titleOf(project)}</h3>
          <p className="work-description">{project.description}</p>
          <ul className="work-stack" aria-label="Technologies">{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
          <div className="work-actions">
            {live && <a className="button button-primary work-demo" href={project.liveUrl} target="_blank" rel="noreferrer">Explore project <ArrowUpRight size={16} /></a>}
            {project.title === "Fziyen.dev" && <span className="work-current"><Radio size={14} /> You’re here</span>}
            {project.githubUrl && project.githubUrl !== "#" && <a className="text-link work-source" href={project.githubUrl} target="_blank" rel="noreferrer"><Github size={15} />{isProfile ? "GitHub profile" : "Source code"}<ArrowUpRight size={13} /></a>}
          </div>
        </div>
      </article>
      <div className="work-browse-bar">
        <p aria-live="polite" aria-atomic="true">
          <span className="work-browse-count">{numberOf(selected)}</span> / {total}
          <span className="work-browse-label">Browse projects</span>
        </p>
        <div className="work-ticks" aria-hidden="true">
          {projectsData.map((item, index) => <i key={item.title} className={index === selected ? "is-active" : undefined} />)}
        </div>
        <div className="work-stepper">
          <button type="button" className="icon-button" onClick={() => choose(-1)} aria-label="Previous project" aria-controls="selected-work"><ArrowLeft size={16} /></button>
          <button type="button" className="icon-button" onClick={() => choose(1)} aria-label="Next project" aria-controls="selected-work"><ArrowRight size={16} /></button>
        </div>
      </div>
      <div className="work-thumbnails" role="group" aria-label="Choose a project" ref={strip}>
        {projectsData.map((item, index) => (
          <button type="button" key={item.title} className="work-thumbnail" aria-pressed={selected === index} aria-controls="selected-work" onClick={() => setSelected(index)}>
            <Preview project={item} thumbnail />
            <span className="work-thumbnail-caption"><span>{numberOf(index)}</span><strong>{titleOf(item)}</strong></span>
          </button>
        ))}
      </div>
    </div>
  );
}
