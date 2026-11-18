import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import { shouldRenderFrame } from "../frameGate";

/**
 * One camera drives both the WebGL terrain and the HTML chapter panels.
 * Each chapter is anchored at a fixed point in the terrain world, so the
 * camera literally flies to the next panel instead of the panel being a
 * flat overlay that animates on its own.
 */
export interface JourneyMotion {
  /** Camera position in world units. */
  x: number;
  y: number;
  z: number;
  /** Yaw in radians; 0 looks towards -z. */
  heading: number;
  pitch: number;
  bank: number;
  /** Increments whenever the pose changes, so a paused renderer can redraw. */
  version: number;
}

type Mat4 = number[];

const CHAPTER_COUNT = 6;
// The route zig-zags with real ~60-degree turns. Turning the same way every
// time would curl the route back on itself and put the last chapter right
// next to the first.
const headings = [0, 62, 0, 64, 2, 66].map((degrees) => degrees * Math.PI / 180);
const CAMERA_HEIGHT = 5.6;
// How far in front of its camera stop a chapter panel stands, in world units.
const PANEL_DISTANCE = 12;
// Chapters other than the current one are background scenery: faint,
// blurred, glitching holograms. Only the neighbours ahead and behind show.
const GHOST_OPACITY = 0.2;
const GHOST_BLUR = 6;
const FOCUS_RATE = 9;
// Destinations are separated by nearly one full visible terrain tile radius.
// Fixed coordinates also make backwards navigation return to the same place.
const destinations = [{ x: 0, z: 16 }];
for (let index = 1; index < CHAPTER_COUNT; index++) {
  const bearing = (headings[index - 1] + headings[index]) / 2;
  const previous = destinations[index - 1];
  destinations.push({
    x: previous.x + Math.sin(bearing) * 96,
    z: previous.z - Math.cos(bearing) * 96,
  });
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const nearestAngle = (from: number, to: number) =>
  from + Math.atan2(Math.sin(to - from), Math.cos(to - from));
const bezier = (a: number, b: number, c: number, d: number, t: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
const bezierSlope = (a: number, b: number, c: number, d: number, t: number) =>
  3 * (1 - t) ** 2 * (b - a) + 6 * (1 - t) * t * (c - b) + 3 * t * t * (d - c);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// Column-major 4x4 helpers, matching CSS matrix3d().
const multiply = (a: Mat4, b: Mat4): Mat4 => {
  const out = new Array<number>(16);
  for (let column = 0; column < 4; column++)
    for (let row = 0; row < 4; row++)
      out[column * 4 + row] =
        a[row] * b[column * 4] + a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] + a[12 + row] * b[column * 4 + 3];
  return out;
};
const translate = (x: number, y: number, z: number): Mat4 =>
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const rotateX = (a: number): Mat4 =>
  [1, 0, 0, 0, 0, Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1];
const rotateY = (a: number): Mat4 =>
  [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1];
const rotateZ = (a: number): Mat4 =>
  [Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const FLIP_Y: Mat4 = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

interface PanelLayout {
  element: HTMLElement;
  /** Panel centre relative to the viewport centre, in CSS pixels. */
  offsetX: number;
  offsetY: number;
  /** World anchor of the panel centre. */
  worldX: number;
  worldY: number;
  worldZ: number;
  heading: number;
}

export function useJourneyMotion(
  travel: MutableRefObject<number>,
  stage: RefObject<HTMLElement>,
  paused: boolean,
  onArrival: (index: number) => void,
) {
  const initialIndex = clamp(Math.round(travel.current), 0, CHAPTER_COUNT - 1);
  const motion = useRef<JourneyMotion>({
    x: destinations[initialIndex].x,
    y: CAMERA_HEIGHT,
    z: destinations[initialIndex].z,
    heading: headings[initialIndex],
    pitch: 0,
    bank: 0,
    version: 0,
  });
  // The flight base (without hover and pointer parallax) survives re-runs of
  // the effect, e.g. when motion is toggled.
  const base = useRef({ x: motion.current.x, z: motion.current.z, heading: motion.current.heading });

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const elements = Array.from(host.querySelectorAll<HTMLElement>("[data-chapter-index]"));
    let panels: PanelLayout[] = [];
    let focal = 1;
    let pxPerUnit = 1;

    // Panels are placed so that, seen from their own camera stop, they land
    // exactly on their normal layout box: crisp and readable once arrived.
    const layout = () => {
      focal = (window.innerHeight / 2) / Math.tan((58 / 2) * Math.PI / 180);
      pxPerUnit = focal / PANEL_DISTANCE;
      const box = host.getBoundingClientRect();
      const centreX = window.innerWidth / 2 - box.left;
      const centreY = window.innerHeight / 2 - box.top;
      host.style.perspective = `${focal}px`;
      host.style.perspectiveOrigin = `${centreX}px ${centreY}px`;
      panels = elements.map((element) => {
        const index = Number(element.dataset.chapterIndex);
        const heading = headings[index];
        const offsetX = element.offsetLeft + element.offsetWidth / 2 - centreX;
        const offsetY = element.offsetTop + element.offsetHeight / 2 - centreY;
        const forwardX = Math.sin(heading), forwardZ = -Math.cos(heading);
        const rightX = Math.cos(heading), rightZ = Math.sin(heading);
        const along = offsetX / pxPerUnit;
        return {
          element, offsetX, offsetY, heading,
          worldX: destinations[index].x + forwardX * PANEL_DISTANCE + rightX * along,
          worldY: CAMERA_HEIGHT - offsetY / pxPerUnit,
          worldZ: destinations[index].z + forwardZ * PANEL_DISTANCE + rightZ * along,
        };
      });
    };

    // 1 = the chapter in focus, 0 = scenery. Presence fades chapters that
    // are not a neighbour of the current one out of the world entirely.
    const startIndex = clamp(Math.round(travel.current), 0, CHAPTER_COUNT - 1);
    const focus = elements.map((element) => Number(Number(element.dataset.chapterIndex) === startIndex));
    const presence = elements.map((element) => Number(Math.abs(Number(element.dataset.chapterIndex) - startIndex) <= 1));
    const glitchUntil = elements.map(() => 0);
    let clock = performance.now();
    // Last value written per panel and property. Unchanged values are not
    // written again, so steady panels cost no style invalidation per frame.
    const written = elements.map(() => new Map<string, string>());
    const write = (slot: number, property: string, value: string) => {
      if (written[slot].get(property) === value) return;
      written[slot].set(property, value);
      const element = elements[slot];
      if (property === "ghost") {
        if (value) element.dataset.ghost = value;
        else delete element.dataset.ghost;
      } else {
        element.style.setProperty(property, value);
      }
    };

    const paint = (animating: boolean) => {
      const camera = motion.current;
      // World (in px) -> camera space.
      const view = multiply(
        multiply(rotateZ(camera.bank), rotateX(-camera.pitch)),
        multiply(rotateY(camera.heading), translate(-camera.x * pxPerUnit, -camera.y * pxPerUnit, -camera.z * pxPerUnit)),
      );
      for (const [slot, panel] of panels.entries()) {
        const world = multiply(
          translate(panel.worldX * pxPerUnit, panel.worldY * pxPerUnit, panel.worldZ * pxPerUnit),
          rotateY(-panel.heading),
        );
        const eye = multiply(view, world);
        const depth = -eye[14] / pxPerUnit;
        // Panels face the camera from their own stop; seen from behind or
        // edge-on they disappear, like a real one-sided screen.
        const facing = Math.cos(panel.heading - camera.heading);
        const opacity =
          // Dissolve as the camera closes in past its reading distance, so
          // leaving a chapter flies through it rather than into giant text.
          smoothstep(6, PANEL_DISTANCE - 0.6, depth) *(1 - smoothstep(55, 140, depth)) * smoothstep(0.15, 0.45, facing);
        const sharpness = focus[slot];
        const ghost = 1 - sharpness;
        // Unfocused chapters flicker in short bursts with a sideways tear.
        if (!paused && ghost > 0.4 && clock > glitchUntil[slot] && Math.random() < 0.012)
          glitchUntil[slot] = clock + 70 + Math.random() * 160;
        const glitching = !paused && ghost > 0.4 && clock < glitchUntil[slot];
        const visibleOpacity =
          opacity * presence[slot] * (GHOST_OPACITY + (1 - GHOST_OPACITY) * sharpness ** 2) *
          (glitching ? 0.35 + Math.random() * 1.1 : 1);
        if (visibleOpacity < 0.01) {
          write(slot, "visibility", "hidden");
          write(slot, "will-change", "");
          continue;
        }
        const tear = glitching ? (Math.random() - 0.5) * 26 * ghost : 0;
        const matrix = multiply(
          multiply(translate(tear - panel.offsetX, -panel.offsetY, focal), FLIP_Y),
          multiply(eye, FLIP_Y),
        );
        write(slot, "visibility", "visible");
        write(slot, "opacity", Math.min(1, visibleOpacity).toFixed(3));
        write(slot, "transform", `matrix3d(${matrix.map((value) => +value.toFixed(6)).join(",")})`);
        write(slot, "will-change", animating ? "transform, opacity" : "");
        // Keep the focused chapter filter-free: crisp text and working
        // backdrop blur on its cards.
        if (ghost < 0.01) {
          write(slot, "filter", "");
          write(slot, "ghost", "");
        } else {
          const split = (ghost * (glitching ? 7 : 2.5)).toFixed(1);
          write(slot, "filter",
            `blur(${(ghost * GHOST_BLUR).toFixed(2)}px) ` +
            `drop-shadow(${split}px 0 0 rgba(255, 60, 220, ${(0.55 * ghost).toFixed(2)})) ` +
            `drop-shadow(-${split}px 0 0 rgba(80, 220, 255, ${(0.45 * ghost).toFixed(2)}))`);
          write(slot, "ghost", ghost > 0.4 ? (glitching ? "glitch" : "idle") : "");
        }
      }
    };

    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    const resizeObserver = new ResizeObserver(() => {
      layout();
      paint(false);
    });
    elements.forEach((element) => resizeObserver.observe(element));
    resizeObserver.observe(host);
    window.addEventListener("pointermove", onPointer, { passive: true });

    let frame = 0;
    let last = performance.now();
    let time = 0;
    let targetIndex = -1;
    let parallaxX = 0;
    let pitch = 0;
    let flight: {
      start: number;
      duration: number;
      points: [number, number][];
    } | null = null;

    const settle = (index: number) => {
      base.current = { x: destinations[index].x, z: destinations[index].z, heading: headings[index] };
      flight = null;
    };

    layout();

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      if (!shouldRenderFrame(now)) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      const camera = motion.current;
      const target = clamp(Math.round(travel.current), 0, CHAPTER_COUNT - 1);
      const state = base.current;

      if (target !== targetIndex) {
        const first = targetIndex === -1;
        targetIndex = target;
        onArrival(target);
        const destination = destinations[target];
        const distance = Math.hypot(destination.x - state.x, destination.z - state.z);
        if (paused || first || distance < 0.01) {
          settle(target);
        } else {
          // Always fly forwards: leave along the current view direction and
          // arrive from behind the destination, facing its panel. Going back
          // a chapter therefore becomes a sweeping turn, never a reverse.
          const handle = distance * 0.42;
          flight = {
            start: now,
            duration: clamp(1100 + distance * 3, 1300, 2600),
            points: [
              [state.x, state.z],
              [state.x + Math.sin(state.heading) * handle, state.z - Math.cos(state.heading) * handle],
              [destination.x - Math.sin(headings[target]) * handle, destination.z + Math.cos(headings[target]) * handle],
              [destination.x, destination.z],
            ],
          };
        }
      }

      let focusMoving = false;
      // Real elapsed time (not the clamped dt), so focus keeps pace with the
      // flight even when the browser drops frames.
      const ease = paused ? 1 : 1 - Math.exp(-((now - clock) / 1000) * FOCUS_RATE);
      // The destination stays a ghost for the first half of the flight and
      // sharpens over the final approach, landing fully in focus.
      const arrival = flight ? smoothstep(0.45, 0.95, (now - flight.start) / flight.duration) : 1;
      for (const [slot, element] of elements.entries()) {
        const index = Number(element.dataset.chapterIndex);
        const goals = [index === target ? arrival : 0, Number(Math.abs(index - target) <= 1)];
        const values = [focus, presence];
        for (const [kind, goal] of goals.entries()) {
          const list = values[kind];
          let value = list[slot] + (goal - list[slot]) * ease;
          if (Math.abs(goal - value) < 0.002) value = goal;
          if (value !== list[slot]) focusMoving = true;
          list[slot] = value;
        }
      }

      clock = now;

      let turnRate = 0;
      if (flight) {
        const raw = Math.min(1, (now - flight.start) / flight.duration);
        const t = easeInOut(raw);
        const [p0, p1, p2, p3] = flight.points;
        state.x = bezier(p0[0], p1[0], p2[0], p3[0], t);
        state.z = bezier(p0[1], p1[1], p2[1], p3[1], t);
        // Look along the flight path, so the next panel swings into view as
        // the camera banks towards it.
        const dx = bezierSlope(p0[0], p1[0], p2[0], p3[0], t);
        const dz = bezierSlope(p0[1], p1[1], p2[1], p3[1], t);
        if (Math.hypot(dx, dz) > 1e-3) {
          const nextHeading = nearestAngle(state.heading, Math.atan2(dx, -dz));
          turnRate = dt > 0 ? (nextHeading - state.heading) / dt : 0;
          state.heading = nextHeading;
        }
        if (raw === 1) settle(target);
      }

      if (paused) {
        parallaxX = 0;
        pitch = 0;
      } else {
        time += dt;
        parallaxX += (pointer.x * 0.9 - parallaxX) * (1 - Math.exp(-dt * 2));
        pitch += (-pointer.y * 0.025 - pitch) * (1 - Math.exp(-dt * 2));
      }
      // A slow hover keeps the camera alive between flights; because panels
      // live in the world, they shift against the terrain like real objects.
      const swayX = paused ? 0 : parallaxX + Math.sin(time * 0.37) * 0.12;
      const bob = paused ? 0 : Math.sin(time * 0.55) * 0.07;
      const bankTarget = clamp(turnRate * 0.05, -0.06, 0.06);
      const bank = camera.bank + (bankTarget - camera.bank) * (1 - Math.exp(-dt * 6));
      const next = {
        x: state.x + Math.cos(state.heading) * swayX,
        y: CAMERA_HEIGHT + bob,
        z: state.z + Math.sin(state.heading) * swayX,
        heading: state.heading,
        pitch,
        bank: Math.abs(bank) < 1e-5 ? 0 : bank,
      };
      // With motion off the camera rests, so skip repainting identical frames.
      const changed = (Object.keys(next) as (keyof typeof next)[]).some((key) => next[key] !== camera[key]);
      if (!changed && !focusMoving && camera.version > 0) return;
      Object.assign(camera, next);
      camera.version++;
      paint(flight !== null);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [travel, stage, paused, onArrival]);

  return motion;
}
