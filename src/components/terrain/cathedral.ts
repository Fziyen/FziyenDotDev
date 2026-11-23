/**
 * A dot model of Helsinki Cathedral (C. L. Engel, Senate Square).
 *
 * The real building is a Greek cross: four equal arms, each ending in a
 * six-column Corinthian portico with a pediment, with gable roofs over the
 * arms. A tall drum ringed by columns carries the great dome, its columned
 * lantern and cross; four small domed bell towers stand in the corners
 * between the arms; statues of the apostles stand on the pediments; and the
 * south front, facing the square, rises from a monumental flight of stairs.
 *
 * Built in "design units" (about 26 tall), then scaled. x runs across the
 * front, y up, z towards the viewer: the stairs face +z. Edges, columns,
 * meridians and rings are drawn as bright lines; walls, roofs and domes get
 * a sparse, dimmer fill so the volumes read as solid.
 */

type Point = { x: number; y: number; z: number; w: number };

export interface CathedralCloud {
  /** Final positions (local space). */
  target: Float32Array;
  /** Where each dot starts, scattered on the ground around the building. */
  start: Float32Array;
  /** 0..1, when each dot sets off: low parts first, with some jitter. */
  delay: Float32Array;
  /** Random per-dot seed for twinkle. */
  seed: Float32Array;
  /** Brightness: lines 1, fills dimmer, the far side of the building dimmer. */
  weight: Float32Array;
  count: number;
}

// Deterministic random numbers, so the model is the same on every load.
let state = 20251;
const random = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 4294967296;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const FILL = 0.42;

class Builder {
  points: Point[] = [];
  constructor(private step: number) {}

  dot(x: number, y: number, z: number, w = 1) {
    this.points.push({ x, y, z, w });
  }

  line(ax: number, ay: number, az: number, bx: number, by: number, bz: number, density = 1, w = 1) {
    const length = Math.hypot(bx - ax, by - ay, bz - az);
    const count = Math.max(1, Math.round((length / this.step) * density));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      this.dot(lerp(ax, bx, t), lerp(ay, by, t), lerp(az, bz, t), w);
    }
  }

  ring(cx: number, y: number, cz: number, r: number, density = 1, w = 1) {
    const count = Math.max(10, Math.round(((TAU * r) / this.step) * density));
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU;
      this.dot(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, w);
    }
  }

  /** Random fill of a parallelogram: origin plus u and v edge vectors. */
  plane(o: number[], u: number[], v: number[], density: number) {
    const area = Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
    const count = Math.round((area / (this.step * this.step)) * density);
    for (let i = 0; i < count; i++) {
      const s = random(), t = random();
      this.dot(o[0] + u[0] * s + v[0] * t, o[1] + u[1] * s + v[1] * t, o[2] + u[2] * s + v[2] * t, FILL);
    }
  }

  /** Random fill of a triangle. */
  triangle(a: number[], b: number[], c: number[], density: number) {
    const area = 0.5 * Math.hypot(
      (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
      (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
      (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    const count = Math.round((area / (this.step * this.step)) * density);
    for (let i = 0; i < count; i++) {
      let s = random(), t = random();
      if (s + t > 1) { s = 1 - s; t = 1 - t; }
      this.dot(a[0] + (b[0] - a[0]) * s + (c[0] - a[0]) * t, a[1] + (b[1] - a[1]) * s + (c[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * s + (c[2] - a[2]) * t, FILL);
    }
  }

  /** A column: shaft line, base and capital rings. */
  column(x: number, z: number, y0: number, y1: number, r: number) {
    this.line(x, y0, z, x, y1, z, 1.5);
    this.ring(x, y0 + 0.12, z, r * 1.25, 1.4);
    this.ring(x, y1 - 0.1, z, r * 1.35, 1.4);
    this.ring(x, (y0 + y1) / 2, z, r, 0.8, 0.6);
  }

  /** Cylinder wall: rings plus a sparse surface fill. */
  cylinder(cx: number, cz: number, r: number, y0: number, y1: number, density: number) {
    const count = Math.round(((TAU * r * (y1 - y0)) / (this.step * this.step)) * density);
    for (let i = 0; i < count; i++) {
      const a = random() * TAU;
      this.dot(cx + Math.cos(a) * r, lerp(y0, y1, random()), cz + Math.sin(a) * r, FILL);
    }
  }

  /** A raised dome: meridians, rings and a surface fill. height > r makes it taller than a hemisphere. */
  dome(cx: number, y: number, cz: number, r: number, height: number, meridians: number, rings: number, fill: number) {
    const shape = (t: number) => ({ r: Math.cos(t) * r, y: y + Math.sin(t) * height });
    for (let m = 0; m < meridians; m++) {
      const a = (m / meridians) * TAU;
      const count = Math.round((Math.PI * 0.5 * Math.max(r, height)) / this.step * 1.2);
      for (let i = 0; i <= count; i++) {
        const p = shape((i / count) * Math.PI * 0.5);
        this.dot(cx + Math.cos(a) * p.r, p.y, cz + Math.sin(a) * p.r);
      }
    }
    for (let k = 0; k <= rings; k++) {
      const p = shape((k / (rings + 1)) * Math.PI * 0.5);
      this.ring(cx, p.y, cz, p.r, 1.1);
    }
    const area = TAU * r * Math.max(r, height);
    const count = Math.round((area / (this.step * this.step)) * fill);
    for (let i = 0; i < count; i++) {
      const p = shape(Math.asin(random()));
      const a = random() * TAU;
      this.dot(cx + Math.cos(a) * p.r, p.y, cz + Math.sin(a) * p.r, FILL);
    }
  }

  cross(cx: number, y: number, cz: number, size: number) {
    this.line(cx, y, cz, cx, y + size, cz, 2.2);
    this.line(cx - size * 0.3, y + size * 0.7, cz, cx + size * 0.3, y + size * 0.7, cz, 2.2);
  }

  /** A statue: a short, dense figure on a plinth. */
  statue(x: number, y: number, z: number, h = 1.3) {
    this.line(x, y, z, x, y + h, z, 3);
    this.ring(x, y + h * 0.82, z, 0.14, 1.5);
    this.ring(x, y + h * 0.4, z, 0.2, 1.5);
  }
}

// Main proportions, in design units. The body is a near-square block; the
// arms of the cross project only a little from the middle of each side, and
// each carries a deep portico. The bell towers sit on the block's corners.
const BLOCK = 7.2; // half-width of the main square block
const CORE = 4.3; // half-width of each projecting arm
const ARM = 8.5; // distance from the centre to the end wall of an arm
const BASE = 2.9; // top of the podium
const CORNICE = 10.4; // top of the walls
const RIDGE = 12.4; // ridge of the arm roofs
const PORTICO = 2.3; // how far a portico stands in front of its arm
const PODIUM = ARM + PORTICO + 0.6;

/** Draws one arm (its walls, gable roof and portico) rotated to face `angle`. */
function arm(b: Builder, angle: number) {
  const c = Math.cos(angle), s = Math.sin(angle);
  // Local arm space: u across the arm, along = outwards from the centre.
  const P = (u: number, y: number, along: number) => [u * c + along * s, y, -u * s + along * c];
  const L = (u0: number, y0: number, a0: number, u1: number, y1: number, a1: number, density = 1, w = 1) => {
    const p = P(u0, y0, a0), q = P(u1, y1, a1);
    b.line(p[0], p[1], p[2], q[0], q[1], q[2], density, w);
  };
  const sub = (p: number[], q: number[]) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];

  const fill = (o: number[], p: number[], q: number[], density: number) => b.plane(o, sub(p, o), sub(q, o), density);

  // Podium outline under this side: the portico platform, then the block.
  for (const y of [0, BASE]) {
    L(-CORE - 0.6, y, PODIUM, CORE + 0.6, y, PODIUM);
    for (const u of [-CORE - 0.6, CORE + 0.6]) L(u, y, PODIUM, u, y, BLOCK + 0.6);
    L(-BLOCK - 0.6, y, BLOCK + 0.6, -CORE - 0.6, y, BLOCK + 0.6);
    L(CORE + 0.6, y, BLOCK + 0.6, BLOCK + 0.6, y, BLOCK + 0.6);
  }

  // The block's wall on this side, either side of the arm: plain ashlar with
  // corner pilasters, one tall window each, a cornice and a low parapet.
  for (const side of [-1, 1]) {
    const inner = side * CORE, outer = side * BLOCK;
    L(inner, BASE, BLOCK, outer, BASE, BLOCK);
    L(inner, CORNICE, BLOCK, outer, CORNICE, BLOCK, 1.2);
    L(inner, CORNICE - 0.6, BLOCK, outer, CORNICE - 0.6, BLOCK, 0.8, 0.7);
    L(inner, CORNICE + 0.5, BLOCK, outer, CORNICE + 0.5, BLOCK, 0.8, 0.7);
    L(outer, BASE, BLOCK, outer, CORNICE + 0.5, BLOCK);
    L(outer - side * 0.45, BASE, BLOCK + 0.02, outer - side * 0.45, CORNICE - 0.6, BLOCK + 0.02, 1, 0.7);
    fill(P(inner, BASE, BLOCK), P(outer, BASE, BLOCK), P(inner, CORNICE, BLOCK), 0.14);
    const mid = side * (CORE + BLOCK) / 2;
    L(mid - 0.55, 4.6, BLOCK, mid - 0.55, 8.0, BLOCK, 1, 0.8);
    L(mid + 0.55, 4.6, BLOCK, mid + 0.55, 8.0, BLOCK, 1, 0.8);
    L(mid - 0.55, 4.6, BLOCK, mid + 0.55, 4.6, BLOCK, 1, 0.8);
    L(mid - 0.55, 8.0, BLOCK, mid, 8.6, BLOCK, 1, 0.8);
    L(mid + 0.55, 8.0, BLOCK, mid, 8.6, BLOCK, 1, 0.8);
  }

  // The arm itself: short side walls, the end wall with its door.
  for (const u of [-CORE, CORE]) {
    L(u, BASE, BLOCK, u, BASE, ARM);
    L(u, CORNICE, BLOCK, u, CORNICE, ARM);
    L(u, BASE, ARM, u, CORNICE, ARM);
    L(u, BASE, BLOCK, u, CORNICE, BLOCK, 0.8, 0.7);
    fill(P(u, BASE, BLOCK), P(u, BASE, ARM), P(u, CORNICE, BLOCK), 0.14);
  }
  fill(P(-CORE, BASE, ARM), P(CORE, BASE, ARM), P(-CORE, CORNICE, ARM), 0.12);
  L(-1.0, BASE, ARM, -1.0, 7.0, ARM, 1, 0.8);
  L(1.0, BASE, ARM, 1.0, 7.0, ARM, 1, 0.8);
  L(-1.0, 7.0, ARM, 1.0, 7.0, ARM, 1, 0.8);
  // Windows above the side doors of the portico wall.
  for (const u of [-2.7, 2.7]) {
    L(u - 0.4, 5.0, ARM, u - 0.4, 7.6, ARM, 1, 0.7);
    L(u + 0.4, 5.0, ARM, u + 0.4, 7.6, ARM, 1, 0.7);
  }

  // Gable roof over the arm, running from the drum out to the pediment.
  L(0, RIDGE, 3.6, 0, RIDGE, ARM + PORTICO);
  for (const u of [-CORE, CORE]) {
    L(u, CORNICE, 3.6, u, CORNICE, ARM, 0.8, 0.7);
    fill(P(u, CORNICE, 3.6), P(u, CORNICE, ARM + PORTICO), P(0, RIDGE, 3.6), 0.12);
  }

  // Portico: six columns on a stylobate, entablature, pediment.
  const front = ARM + PORTICO;
  const capital = CORNICE - 0.75;
  for (let i = 0; i < 6; i++) {
    const u = lerp(-CORE + 0.45, CORE - 0.45, i / 5);
    const p = P(u, 0, front - 0.3);
    b.column(p[0], p[2], BASE, capital, 0.28);
  }
  // Return columns at the sides, between the front row and the wall.
  for (const u of [-CORE + 0.45, CORE - 0.45]) {
    const p = P(u, 0, ARM + PORTICO * 0.45);
    b.column(p[0], p[2], BASE, capital, 0.26);
  }
  // Entablature box.
  for (const y of [capital, CORNICE - 0.25, CORNICE + 0.15]) {
    L(-CORE - 0.2, y, front, CORE + 0.2, y, front, 1.2);
    for (const u of [-CORE - 0.2, CORE + 0.2]) L(u, y, ARM, u, y, front, 1);
  }
  // Pediment: raking cornices, the tympanum fill and a horizontal cornice.
  const apex = RIDGE + 0.35;
  L(-CORE - 0.4, CORNICE + 0.15, front + 0.1, 0, apex, front + 0.1, 1.5);
  L(CORE + 0.4, CORNICE + 0.15, front + 0.1, 0, apex, front + 0.1, 1.5);
  L(-CORE + 0.3, CORNICE + 0.45, front, 0, apex - 0.45, front, 0.8, 0.6);
  L(CORE - 0.3, CORNICE + 0.45, front, 0, apex - 0.45, front, 0.8, 0.6);
  b.triangle(P(-CORE, CORNICE + 0.2, front), P(CORE, CORNICE + 0.2, front), P(0, apex - 0.1, front), 0.3);
  L(0, apex, front, 0, apex, ARM, 1);
  // Apostles: one on the apex, one on each end of the pediment.
  const top = P(0, apex, front);
  b.statue(top[0], top[1], top[2], 1.5);
  for (const u of [-CORE - 0.1, CORE + 0.1]) {
    const p = P(u, CORNICE + 0.15, front);
    b.statue(p[0], p[1], p[2], 1.3);
  }
}

function buildModel(step: number): Point[] {
  const b = new Builder(step);

  // The monumental stairs down to Senate Square, in front of the south arm.
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const y = BASE * (1 - (i + 1) / steps);
    const z = PODIUM + (i + 1) * 0.52;
    const half = CORE + 1.2 + i * 0.18;
    b.line(-half, y, z, half, y, z, 1.1);
    b.line(-half, y + BASE / steps, z - 0.52, -half, y, z, 1);
    b.line(half, y + BASE / steps, z - 0.52, half, y, z, 1);
  }
  // Stair cheek walls.
  for (const side of [-1, 1]) {
    const outer = CORE + 1.2 + steps * 0.18;
    b.line(side * (CORE + 1.2), BASE + 0.4, PODIUM, side * outer, 0.4, PODIUM + steps * 0.52, 1.2);
  }

  // The four arms with their porticoes, and the block walls between them.
  for (let k = 0; k < 4; k++) arm(b, (k * Math.PI) / 2);

  // Flat block roof behind the parapet, as a sparse fill.
  for (const [x0, z0] of [[-BLOCK, -BLOCK], [CORE, -BLOCK], [-BLOCK, CORE], [CORE, CORE]]) {
    b.plane([x0, CORNICE + 0.3, z0], [BLOCK - CORE, 0, 0], [0, 0, BLOCK - CORE], 0.12);
  }

  // Drum: a plinth rising out of the roofs, a ring of 24 columns around the
  // wall, an entablature and an attic band.
  const drumR = 3.5, colR = 3.95;
  b.ring(0, RIDGE - 0.3, 0, colR + 0.3, 1.2);
  b.ring(0, RIDGE + 0.4, 0, colR + 0.3, 1.2);
  b.cylinder(0, 0, colR + 0.3, RIDGE - 0.3, RIDGE + 0.4, 0.3);
  b.cylinder(0, 0, drumR, RIDGE + 0.4, 17.2, 0.18);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    b.column(Math.cos(a) * colR, Math.sin(a) * colR, RIDGE + 0.4, 17.0, 0.18);
  }
  // Windows between the columns.
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * TAU;
    const x = Math.cos(a) * drumR, z = Math.sin(a) * drumR;
    b.line(x, 13.6, z, x, 16.0, z, 1, 0.7);
  }
  b.ring(0, 17.0, 0, colR + 0.15, 1.3);
  b.ring(0, 17.45, 0, colR + 0.2, 1.3);
  b.ring(0, 18.3, 0, drumR + 0.1, 1.2);
  b.cylinder(0, 0, drumR + 0.1, 17.45, 18.3, 0.35);

  // The great dome, raised above a hemisphere, then the lantern and cross.
  b.dome(0, 18.3, 0, drumR + 0.1, 4.7, 24, 5, 0.3);
  b.ring(0, 22.9, 0, 0.95, 1.4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.line(Math.cos(a) * 0.85, 22.9, Math.sin(a) * 0.85, Math.cos(a) * 0.85, 24.1, Math.sin(a) * 0.85, 2);
  }
  b.ring(0, 24.1, 0, 0.95, 1.4);
  b.dome(0, 24.1, 0, 0.95, 0.7, 10, 1, 0.3);
  b.ring(0, 24.95, 0, 0.18, 2);
  b.cross(0, 25.0, 0, 1.8);

  // Four bell towers on the corners of the block: a square base, a ring of
  // columns, a small raised dome, lantern and cross.
  const tower = (CORE + BLOCK) / 2 + 0.2;
  const towerBase = CORNICE + 0.5, towerTop = towerBase + 0.9;
  for (const [x, z] of [[-tower, -tower], [tower, -tower], [-tower, tower], [tower, tower]]) {
    const h = 1.45;
    for (const y of [towerBase, towerTop]) {
      b.line(x - h, y, z - h, x + h, y, z - h);
      b.line(x - h, y, z + h, x + h, y, z + h);
      b.line(x - h, y, z - h, x - h, y, z + h);
      b.line(x + h, y, z - h, x + h, y, z + h);
    }
    for (const [dx, dz] of [[-h, -h], [h, -h], [-h, h], [h, h]]) b.line(x + dx, towerBase, z + dz, x + dx, towerTop, z + dz);
    b.cylinder(x, z, 1.1, towerTop, towerTop + 2.6, 0.2);
    b.ring(x, towerTop, z, 1.3, 1.2);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.column(x + Math.cos(a) * 1.22, z + Math.sin(a) * 1.22, towerTop, towerTop + 2.6, 0.11);
    }
    b.ring(x, towerTop + 2.6, z, 1.35, 1.2);
    b.ring(x, towerTop + 2.95, z, 1.3, 1.2);
    b.dome(x, towerTop + 2.95, z, 1.3, 1.75, 12, 2, 0.3);
    b.ring(x, towerTop + 4.65, z, 0.35, 1.5);
    b.line(x, towerTop + 4.65, z, x, towerTop + 5.15, z, 2);
    b.cross(x, towerTop + 5.15, z, 0.95);
  }

  // Apostle statues on the corners of the block.
  for (const [x, z] of [[-BLOCK, -BLOCK], [BLOCK, -BLOCK], [-BLOCK, BLOCK], [BLOCK, BLOCK]]) {
    b.statue(x, CORNICE + 0.5, z, 1.2);
  }

  return b.points;
}

/**
 * Builds the cloud. `detail` 1 is desktop density, lower for phones.
 * `scale` converts design units to world units. `view` is the direction
 * (in model space, x/z) the building is seen from: dots on the far side are
 * dimmed so the near facade reads first.
 */
export function buildCathedral(detail = 1, scale = 0.72, view: [number, number] = [0, 1]): CathedralCloud {
  state = 20251;
  const model = buildModel(0.13 / detail);
  const count = model.length;
  const target = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const seed = new Float32Array(count);
  const weight = new Float32Array(count);
  const length = Math.hypot(view[0], view[1]) || 1;
  const vx = view[0] / length, vz = view[1] / length;
  const reach = ARM + PORTICO + 4;
  for (let i = 0; i < count; i++) {
    const { x, y, z, w } = model[i];
    const jitter = 0.035;
    target[i * 3] = (x + (random() - 0.5) * jitter) * scale;
    target[i * 3 + 1] = (y + (random() - 0.5) * jitter) * scale;
    target[i * 3 + 2] = (z + (random() - 0.5) * jitter) * scale;
    // Start on the ground in a wide disc around the footprint.
    const angle = random() * TAU;
    const radius = 3 + Math.sqrt(random()) * 16;
    start[i * 3] = x * scale * 0.4 + Math.cos(angle) * radius;
    start[i * 3 + 1] = -1.5 - random() * 2;
    start[i * 3 + 2] = z * scale * 0.4 + Math.sin(angle) * radius;
    // Build from the ground up.
    delay[i] = Math.min(1, (y / 26) * 0.75 + random() * 0.25);
    seed[i] = random();
    // Near side bright, far side about 40%: the facade reads over the back.
    const facing = Math.max(-1, Math.min(1, (x * vx + z * vz) / reach));
    weight[i] = w * lerp(0.4, 1, (facing + 1) / 2);
  }
  return { target, start, delay, seed, weight, count };
}
