import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";

export interface JourneyMotion {
  position: number;
  heading: number;
  bank: number;
}

interface PanelPose {
  opacity: number;
  x: number;
  depth: number;
  yaw: number;
}

// Each chapter sits at the end of a different bend in the same valley.
const headings = [0, 0.38, -0.3, 0.34, -0.32, 0.08];
const TURN_DURATION = 480;
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
  });
  const poses = useRef(headings.map((_, index) => settledPose(index === initialIndex)));

  useEffect(() => {
    const panels = Array.from(
      stage.current?.querySelectorAll<HTMLElement>("[data-chapter-index]") ?? [],
    );
    let frame = 0;
    let last = performance.now();
    let targetIndex = -1;
    let transition: {
      start: number;
      position: number;
      heading: number;
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
        const direction = Math.sign(headings[target] - state.heading) || 1;
        const distance = Math.min(window.innerWidth * 0.09, 120);
        // Retarget from the currently visible poses, including on a rapid
        // reversal. Direct navigation blends straight to its destination.
        const from = poses.current.map((pose, index) =>
          index === target && pose.opacity === 0
            ? { opacity: 0, x: direction * distance, depth: -120, yaw: -direction * 5 }
            : { ...pose },
        );
        const to = poses.current.map((pose, index) =>
          index === target ? settledPose(true) : {
            opacity: 0,
            x: pose.x - direction * distance,
            depth: -80,
            yaw: direction * 4,
          },
        );
        transition = {
          start: now, position: state.position, heading: state.heading, from, to,
        };
        // Initial load and motion-off navigation do not need an entrance.
        if (paused || (state.position === target && poses.current[target].opacity === 1)) {
          state.position = target;
          state.heading = headings[target];
          state.bank = 0;
          poses.current = headings.map((_, index) => settledPose(index === target));
          transition = null;
          paint(false);
        }
      }

      if (!transition) {
        state.bank *= Math.exp(-dt * 12);
        return;
      }
      const progress = Math.min(1, (now - transition.start) / TURN_DURATION);
      // Fast initial response with a gentle landing and an exact end time.
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextHeading = mix(transition.heading, headings[target], eased);
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
