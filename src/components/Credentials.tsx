import { ArrowUpRight } from "lucide-react";
import { certificationsData, type Certification } from "../data";

const hasLink = (item: Certification) => Boolean(item.credentialUrl && item.credentialUrl !== "#");
const shortDate = (date: string) => date.replace(/^([A-Za-z]{3})[a-z]*/, "$1");

function Row({ item }: { item: Certification }) {
  const linked = hasLink(item);
  // Credly badges (PNG) are full artwork, shown bare; vector logos sit on a tile.
  const badge = /\.png$/i.test(item.iconUrl);
  const body = (
    <>
      <span className={`cred-logo ${badge ? "is-badge" : ""}`}>
        <img src={item.iconUrl} alt="" width={40} height={40} loading="lazy" decoding="async" />
      </span>
      <span className="cred-text">
        <span className="cred-issuer">{item.issuer}</span>
        <span className="cred-title">{item.title}</span>
      </span>
      <span className="cred-side">
        <span className="cred-date">{shortDate(item.date)}</span>
        {linked && <ArrowUpRight className="cred-arrow" size={14} aria-hidden="true" />}
      </span>
    </>
  );
  return linked ? (
    <a className="cred cred-link" href={item.credentialUrl} target="_blank" rel="noreferrer" aria-label={`${item.title}, ${item.issuer}, ${item.date}`}>
      {body}
    </a>
  ) : (
    <div className="cred">{body}</div>
  );
}

/** Certifications as cards in the experience section's style, newest first. */
export function Credentials({ paused }: { paused: boolean }) {
  return (
    <ul className="creds" data-paused={paused}>
      {certificationsData.map((item) => <li key={item.title}><Row item={item} /></li>)}
    </ul>
  );
}
