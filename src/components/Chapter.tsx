import type { ComponentPropsWithoutRef } from "react";

type ChapterProps = ComponentPropsWithoutRef<"section"> & { active: boolean; index: number };

// Keep both layers mounted while the camera turns, but only expose the current
// chapter to keyboard navigation and assistive technology.
export function Chapter({ active, index, className = "", ...props }: ChapterProps) {
  return (
    <section
      {...props}
      ref={(node) => { if (node) node.inert = !active; }}
      className={`chapter ${className}`}
      data-active={active}
      data-chapter-index={index}
      aria-hidden={!active}
    />
  );
}
