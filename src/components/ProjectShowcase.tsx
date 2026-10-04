import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Github, Radio } from "lucide-react";
import { projectsData, type Project } from "../data";

const titleOf = (project: Project) => project.title.replace(/\s*\(\s*Coming soon\.\.\.\)/i, "");
const numberOf = (index: number) => String(index + 1).padStart(2, "0");

function Preview({ project, thumbnail = false }: { project: Project; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`work-preview ${thumbnail ? "work-preview-small" : ""}`}>
      {project.screenshotUrl && !failed ? (
        <img src={project.screenshotUrl} alt={thumbnail ? "" : `${titleOf(project)} preview`} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="work-preview-empty"><Code2 aria-hidden="true" /><span>{titleOf(project)}</span></div>
      )}
    </div>
  );
}

export function ProjectShowcase({ paused }: { paused: boolean }) {
  const [selected, setSelected] = useState(0);
  const project = projectsData[selected];
  if (!project) return null;
  const comingSoon = /coming soon/i.test(project.title);
  const hasDemo = Boolean(project.liveUrl && project.liveUrl !== "#");
  const isProfile = /^https:\/\/github\.com\/[^/]+\/?$/i.test(project.githubUrl);
  const choose = (direction: number) => setSelected(index => (index + direction + projectsData.length) % projectsData.length);

  return (
    <div className="work-showcase" data-paused={paused}>
      <article className="work-feature" id="selected-work" aria-label={titleOf(project)}>
        <div className="work-visual">
          <div className="work-window-bar"><span className="work-window-dots" aria-hidden="true"><i /><i /><i /></span><span>PROJECT PREVIEW</span><span>{numberOf(selected)}</span></div>
          <div className="work-preview-frame" key={project.title}><Preview project={project} /></div>
        </div>
        <div className="work-info" key={`info-${project.title}`}>
          <div className="work-status"><span />{comingSoon ? "In development" : project.featured ? "Featured project" : "Selected work"}</div>
          <h3>{titleOf(project)}</h3>
          <p className="work-description">{project.description}</p>
          <ul className="work-stack" aria-label="Technologies">{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
          <div className="work-actions">
            {hasDemo && <a className="work-demo" href={project.liveUrl} target="_blank" rel="noreferrer">Explore project <ArrowUpRight size={17} /></a>}
            {project.title === "Fziyen.dev" && <span className="work-current"><Radio size={14} /> You’re here</span>}
            {project.githubUrl && project.githubUrl !== "#" && <a className="work-source" href={project.githubUrl} target="_blank" rel="noreferrer"><Github size={16} />{isProfile ? "GitHub profile" : "Source code"}<ArrowUpRight size={14} /></a>}
          </div>
        </div>
      </article>
      <div className="work-browse-bar">
        <p aria-live="polite" aria-atomic="true"><span>{numberOf(selected)}</span> / {String(projectsData.length).padStart(2, "0")}<span className="work-browse-label">Browse projects</span></p>
        <div className="work-stepper"><button type="button" onClick={() => choose(-1)} aria-label="Previous project" aria-controls="selected-work"><ArrowLeft size={17} /></button><button type="button" onClick={() => choose(1)} aria-label="Next project" aria-controls="selected-work"><ArrowRight size={17} /></button></div>
      </div>
      <div className="work-thumbnails" role="group" aria-label="Choose a project">
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
