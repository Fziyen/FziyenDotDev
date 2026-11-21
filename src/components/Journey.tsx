import { useState } from "react";
import { Briefcase, ChevronDown, GraduationCap } from "lucide-react";
import { experienceEducationData, type ExperienceItem } from "../data";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Periods look like "January 2022 -> Present" or "Jan 2023 -> Jun 2025".
interface Month { year: number; month: number; present: boolean }
const parseMonth = (text: string): Month | null => {
  const value = text.trim();
  if (/present|now/i.test(value)) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), present: true };
  }
  const match = value.match(/([a-z]+)\s+(\d{4})/i);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());
  return month < 0 ? null : { year: Number(match[2]), month, present: false };
};
const parsePeriod = (period: string) => {
  const [start, end] = period.split("->").map(parseMonth);
  return start && end ? { start, end } : null;
};

/** "4 yrs 11 mos", counting both the first and last month. */
const durationOf = (period: string) => {
  const range = parsePeriod(period);
  if (!range) return null;
  const months = (range.end.year - range.start.year) * 12 + range.end.month - range.start.month + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} yr${years > 1 ? "s" : ""}`, rest && `${rest} mo${rest > 1 ? "s" : ""}`]
    .filter(Boolean).join(" ");
};

/** "Jan 2022 — Now", "Apr — Jul 2024" or "Sep 2021 — Jul 2024". */
const shortPeriod = (period: string) => {
  const range = parsePeriod(period);
  if (!range) return period.replace("->", "—");
  const { start, end } = range;
  const from = `${SHORT[start.month]} ${start.year}`;
  if (end.present) return `${from} — Now`;
  if (start.year === end.year) return `${SHORT[start.month]} — ${SHORT[end.month]} ${end.year}`;
  return `${from} — ${SHORT[end.month]} ${end.year}`;
};

const isCurrent = (period: string) => Boolean(parsePeriod(period)?.end.present);

function Logo({ item, education }: { item: ExperienceItem; education?: boolean }) {
  if (!item.logoUrl) {
    const Icon = education ? GraduationCap : Briefcase;
    return <span className="xp-logo xp-logo-empty" aria-hidden="true"><Icon size={17} strokeWidth={1.6} /></span>;
  }
  return <span className="xp-logo"><img src={item.logoUrl} alt="" loading="lazy" /></span>;
}

function When({ period, showDuration = true }: { period: string; showDuration?: boolean }) {
  const duration = showDuration ? durationOf(period) : null;
  return (
    <span className="xp-when">
      <span className="xp-period">{shortPeriod(period)}</span>
      {duration && <span className="xp-duration">{duration}</span>}
    </span>
  );
}

/**
 * Experience and education at a glance: every role is one scannable row on a
 * timeline (title, company, dates), and one role at a time opens to show its
 * highlights. Education sits beside it as two short cards.
 */
export function Journey({ paused }: { paused: boolean }) {
  const { work, education } = experienceEducationData;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="xp" data-paused={paused}>
      <section className="xp-column" aria-labelledby="xp-work-label">
        <h3 className="xp-label" id="xp-work-label"><Briefcase size={13} aria-hidden="true" /> Experience</h3>
        <ol className="xp-timeline">
          {work.map((item, index) => {
            const expanded = open === index;
            const current = isCurrent(item.period);
            const points = Array.isArray(item.description) ? item.description : [item.description];
            const panel = `xp-role-${index}`;
            return (
              <li key={`${item.title}-${item.company}`} className={`xp-role ${expanded ? "is-open" : ""} ${current ? "is-current" : ""}`}>
                <span className="xp-node" aria-hidden="true" />
                <button
                  type="button"
                  className="xp-role-head"
                  aria-expanded={expanded}
                  aria-controls={panel}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <Logo item={item} />
                  <span className="xp-role-text">
                    <span className="xp-title">
                      {item.title}
                      {current && <span className="xp-now">Now</span>}
                    </span>
                    <span className="xp-company">{item.company}</span>
                  </span>
                  <When period={item.period} />
                  <ChevronDown className="xp-chevron" size={16} aria-hidden="true" />
                </button>
                <div className="xp-role-body" id={panel} role="region" aria-label={`${item.title} highlights`}>
                  <ul className="xp-points">
                    {points.map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="xp-column" aria-labelledby="xp-edu-label">
        <h3 className="xp-label" id="xp-edu-label"><GraduationCap size={13} aria-hidden="true" /> Education</h3>
        <ul className="xp-schools">
          {education.map((item) => (
            <li key={`${item.title}-${item.company}`} className="xp-school">
              <div className="xp-school-head">
                <Logo item={item} education />
                <When period={item.period} showDuration={false} />
              </div>
              <p className="xp-title">{item.title}</p>
              <p className="xp-company">{item.company}</p>
              <p className="xp-summary">{Array.isArray(item.description) ? item.description.join(" ") : item.description}</p>
              {item.gpa && <span className="xp-gpa">{item.gpa.replace(/\s*:\s*/, " ")}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
