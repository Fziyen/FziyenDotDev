import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";

export interface JourneyMotion {
  position: number;
  heading: number;
  bank: number;
  worldX: number;
  worldZ: number;
}

interface PanelPose {
  opacity: number;
  x: number;
  depth: number;
  yaw: number;
}

// Successive destinations are separated by a real 70-degree camera turn.
const TURN_ANGLE = 70;
const headings = Array.from({ length: 6 }, (_, index) => index * TURN_ANGLE * Math.PI / 180);
const nearestHeading = (from: number, to: number) =>
  from + Math.atan2(Math.sin(to - from), Math.cos(to - from));
const TURN_DURATION = 480;
const FLIGHT_DURATION = 900;
// Destinations are separated by nearly one full visible terrain tile radius.
// Fixed coordinates also make backwards navigation return to the same place.
const destinations = [{ x: 0, z: 16 }];
for (let index = 1; index < headings.length; index++) {
  const bearing = (headings[index - 1] + headings[index]) / 2;
  const previous = destinations[index - 1];
  destinations.push({
    x: previous.x + Math.sin(bearing) * 96,
    z: previous.z - Math.cos(bearing) * 96,
  });
}
const bezier = (start: number, first: number, second: number, end: number, t: number) =>
  (1 - t) ** 3 * start + 3 * (1 - t) ** 2 * t * first +
  3 * (1 - t) * t * t * second + t ** 3 * end;
const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;
const settledPose = (visible: boolean): PanelPose => ({
  opacity: Number(visible), x: 0, depth: 0, yaw: 0,
});

export function useJourneyMotion(
  travel: MutableRefObject<number>,
  stage: RefObject<HTMLElement>,
  paused: boolean,
  onArrival: (index: number) => void,
) {
  const initialIndex = Math.max(0, Math.min(headings.length - 1, Math.round(travel.current)));
  const motion = useRef<JourneyMotion>({
    position: initialIndex,
    heading: headings[initialIndex],
    bank: 0,
    worldX: destinations[initialIndex].x,
    worldZ: destinations[initialIndex].z,
  });
  const poses = useRef(headings.map((_, index) => settledPose(index === initialIndex)));

  useEffect(() => {
    const panels = Array.from(
      stage.current?.querySelectorAll<HTMLElement>("[data-chapter-index]") ?? [],
    );
    let frame = 0;
    let last = performance.now();
    let targetIndex = -1;
    let flight: {
      start: number;
      fromX: number; fromZ: number;
      firstX: number; firstZ: number;
      secondX: number; secondZ: number;
      toX: number; toZ: number;
    } | null = null;
    let transition: {
      start: number;
      position: number;
      heading: number;
      destinationHeading: number;
      from: PanelPose[];
      to: PanelPose[];
    } | null = null;

    const paint = (animating: boolean) => {
      for (const panel of panels) {
        const pose = poses.current[Number(panel.dataset.chapterIndex)];
        panel.style.setProperty("--chapter-opacity", String(pose.opacity));
        panel.style.setProperty("--chapter-x", `${pose.x}px`);
        panel.style.setProperty("--chapter-depth", `${pose.depth}px`);
        panel.style.setProperty("--chapter-yaw", `${pose.yaw}deg`);
        panel.style.visibility = pose.opacity > 0 ? "visible" : "hidden";
        panel.style.willChange = animating && pose.opacity > 0 ? "opacity, transform" : "";
      }
    };
    // Keep the initial chapter visible before the first animation frame.
    paint(false);

    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      const state = motion.current;
      const target = Math.max(0, Math.min(headings.length - 1, Math.round(travel.current)));

      if (target !== targetIndex) {
        targetIndex = target;
        onArrival(target);
        const destinationHeading = nearestHeading(state.heading, headings[target]);
        const direction = Math.sign(destinationHeading - state.heading) || 1;
        const destination = destinations[target];
        const travelDirection = Math.sign(target - state.position) || 1;
        const handle = Math.hypot(destination.x - state.worldX, destination.z - state.worldZ) * 0.36;
        flight = {
          start: now,
          fromX: state.worldX, fromZ: state.worldZ,
          firstX: state.worldX + Math.sin(state.heading) * handle * travelDirection,
          firstZ: state.worldZ - Math.cos(state.heading) * handle * travelDirection,
          secondX: destination.x - Math.sin(destinationHeading) * handle * travelDirection,
          secondZ: destination.z + Math.cos(destinationHeading) * handle * travelDirection,
          toX: destination.x, toZ: destination.z,
        };
        const distance = Math.min(window.innerWidth * 0.16, 220);
        // Retarget from the currently visible poses, including on a rapid
        // reversal. Direct navigation blends straight to its destination.
        const from = poses.current.map((pose, index) =>
          index === target && pose.opacity === 0
            ? { opacity: 0, x: direction * distance, depth: -180, yaw: -direction * TURN_ANGLE }
            : { ...pose },
        );
        const to = poses.current.map((pose, index) =>
          index === target ? settledPose(true) : {
            opacity: 0,
            x: pose.x - direction * distance,
            depth: -140,
            yaw: direction * TURN_ANGLE,
          },
        );
        transition = {
          start: now, position: state.position, heading: state.heading, destinationHeading, from, to,
        };
        // Initial load and motion-off navigation do not need an entrance.
        if (paused || (state.position === target && poses.current[target].opacity === 1)) {
          state.position = target;
          state.heading = headings[target];
          state.bank = 0;
          state.worldX = destination.x;
          state.worldZ = destination.z;
          flight = null;
          poses.current = headings.map((_, index) => settledPose(index === target));
          transition = null;
          paint(false);
        }
      }

      // Travel continues briefly after the text has settled: no content delay,
      // but enough time to visibly pass peaks and arrive at the next location.
      if (flight) {
        const t = Math.min(1, (now - flight.start) / FLIGHT_DURATION);
        const easedFlight = t * t * (3 - 2 * t);
        state.worldX = bezier(flight.fromX, flight.firstX, flight.secondX, flight.toX, easedFlight);
        state.worldZ = bezier(flight.fromZ, flight.firstZ, flight.secondZ, flight.toZ, easedFlight);
        if (t === 1) flight = null;
      }

      if (!transition) {
        state.bank *= Math.exp(-dt * 12);
        return;
      }
      const progress = Math.min(1, (now - transition.start) / TURN_DURATION);
      // Fast initial response with a gentle landing and an exact end time.
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextHeading = mix(transition.heading, transition.destinationHeading, eased);
      const turnRate = dt > 0 ? (nextHeading - state.heading) / dt : 0;
      const bankTarget = Math.max(-0.035, Math.min(0.035, turnRate * 0.06));
      state.bank += (bankTarget - state.bank) * (1 - Math.exp(-dt * 10));
      state.position = mix(transition.position, target, eased);
      state.heading = nextHeading;
      poses.current = transition.from.map((from, index) => {
        const to = transition!.to[index];
        return {
          opacity: mix(from.opacity, to.opacity, eased),
          x: mix(from.x, to.x, eased),
          depth: mix(from.depth, to.depth, eased),
          yaw: mix(from.yaw, to.yaw, eased),
        };
      });
      if (progress === 1) {
        poses.current = headings.map((_, index) => settledPose(index === target));
        transition = null;
      }
      paint(transition !== null);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [travel, stage, paused, onArrival]);

  return motion;
}
