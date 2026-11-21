import { useRef, type PointerEvent } from "react";
import { skillsData } from "../data";

// Bento placement per area, in skillsData order: Frontend is the wide
// tile and AI Engineering the tall one; the rest are single cells.
const SHAPES = ["is-wide", "", "", "", "is-tall", ""];
const ORDER = [0, 1, 4, 3, 2, 5]; // reading order that fills the grid

/**
 * The toolkit as a bento grid of glass tiles. A soft spotlight follows the
 * pointer across the tiles, and each tile carries its area's icon as a large
 * glowing emblem in the corner.
 */
export function Skills({ paused = false }: { paused?: boolean }) {
  const grid = useRef<HTMLUListElement>(null);

  // Each tile gets the pointer position relative to itself, so one light
  // appears to sweep across the whole grid and its borders.
  const track = (event: PointerEvent<HTMLUListElement>) => {
    if (paused || event.pointerType === "touch" || !grid.current) return;
    for (const tile of grid.current.children as HTMLCollectionOf<HTMLElement>) {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
    }
  };

  return (
    <ul className="bento" ref={grid} onPointerMove={track} data-paused={paused}>
      {ORDER.map((index) => {
        const category = skillsData[index];
        if (!category) return null;
        return (
          <li className={`bento-tile ${SHAPES[index]}`} key={category.title}>
            <category.icon className="bento-emblem" aria-hidden="true" strokeWidth={1} />
            <div className="bento-head">
              <span className="bento-icon" aria-hidden="true"><category.icon size={17} strokeWidth={1.6} /></span>
              <h3>{category.title}</h3>
            </div>
            <ul className="bento-skills">
              {category.items.map((item) => (
                <li key={item.name}>
                  <item.icon size={14} strokeWidth={1.7} aria-hidden="true" />
                  {item.name}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
