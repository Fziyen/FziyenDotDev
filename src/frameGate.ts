// Caps animation at ~60fps on high-refresh displays (120Hz, 144Hz, ...),
// roughly halving GPU work there. 60Hz screens are unaffected.
//
// The terrain and the chapter panels run separate requestAnimationFrame
// loops. Every callback in one frame receives the same timestamp, and the
// decision is cached per timestamp, so both loops always render (or skip)
// the same frames and the panels stay locked to the terrain.
const FRAME_INTERVAL = 1000 / 60;
// Accept frames slightly early so vsync jitter never drops frames at 60Hz.
const TOLERANCE = 2;

let lastRendered = -Infinity;
let decidedAt = NaN;
let decision = true;

export function shouldRenderFrame(now: number) {
  if (now === decidedAt) return decision;
  decidedAt = now;
  const elapsed = now - lastRendered;
  decision = elapsed >= FRAME_INTERVAL - TOLERANCE;
  if (decision) {
    // Carry the remainder forward so odd refresh rates (e.g. 144Hz) still
    // average 60fps instead of locking to a lower divisor.
    lastRendered = now - Math.min(Math.max(elapsed - FRAME_INTERVAL, 0), FRAME_INTERVAL / 2);
  }
  return decision;
}
