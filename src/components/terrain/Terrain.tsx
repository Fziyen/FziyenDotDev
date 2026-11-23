import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { dismissStartupLoader } from "../../startupLoader";
import { shouldRenderFrame } from "../../frameGate";
import type { JourneyMotion } from "../../hooks/useJourneyMotion";
import { buildCathedral } from "./cathedral";

interface TerrainProps {
  paused: boolean;
  journey: MutableRefObject<JourneyMotion>;
}

const vertexShader = `
  uniform vec2 uWorldPosition;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform vec2 uForward;
  // Senate Square: x, z, ground height and how far it has levelled (0..1).
  uniform vec4 uPlaza;
  varying float vDepth;
  varying float vHeight;
  varying float vSpark;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    vec3 p = position;
    // Recycle a square of world-anchored points in every direction. A large
    // yaw turn never exposes the edge of the old forward-only terrain strip.
    p.xz = mod(position.xz - uWorldPosition + 140.0, 280.0) - 140.0;
    // Skip points that can never be seen before doing any noise work: those
    // past the fog (fully transparent) and those behind the camera. Moving
    // them outside the clip volume also skips their fragments entirely.
    float flatDepth = length(p.xz);
    if (flatDepth > 135.0 || dot(p.xz, uForward) < -2.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vDepth = 1000.0;
      vHeight = 0.0;
      vSpark = 0.0;
      return;
    }
    vec2 world = p.xz + uWorldPosition;
    vec2 samplePos = world * vec2(0.052, 0.041);
    float n = noise(samplePos) * 0.62 + noise(samplePos * 2.1) * 0.26 + noise(samplePos * 4.3) * 0.12;
    float valley = smoothstep(1.5, 26.0, abs(world.x));
    // Keep a small clearing around the flight path when looking across peaks.
    valley *= smoothstep(8.0, 36.0, flatDepth);
    p.y = pow(n, 1.8) * 28.0 * valley - 5.0;
    p.y += sin(world.x * 0.18 + world.y * 0.04) * 0.45;
    // Around the cathedral the hills level out into a flat square for it to
    // stand on, blending back into the terrain over a wide margin.
    float plaza = (1.0 - smoothstep(16.0, 34.0, length(world - uPlaza.xy))) * uPlaza.w;
    p.y = mix(p.y, uPlaza.z, plaza);
    float glitch = step(0.985, sin(uTime * 0.7)) * step(0.83, noise(vec2(floor(p.z * 0.6), floor(uTime * 9.0))));
    p.x += glitch * sin(uTime * 70.0) * 0.75 * uMotion;
    // Idle hover: a slow swell rolls across the terrain while every dot bobs
    // and drifts on its own phase, so the field stays alive between flights.
    // uTime only advances with motion on, so this freezes when paused.
    float phase = hash(position.xz + 17.0) * 6.2831;
    p.y += sin(world.x * 0.11 + world.y * 0.08 + uTime * 0.55) * 0.3;
    p.y += sin(uTime * 0.9 + phase) * 0.16;
    p.xz += vec2(sin(uTime * 0.47 + phase * 1.7), cos(uTime * 0.39 + phase)) * 0.14;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = length(p.xz);
    vHeight = p.y;
    vSpark = hash(position.xz);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((80.0 / max(5.0, -mv.z)) * uPixelRatio, 1.0 * uPixelRatio, 4.5 * uPixelRatio);
  }
`;
const fragmentShader = `
  varying float vDepth;
  varying float vHeight;
  varying float vSpark;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float glow = exp(-d * d * 3.8);
    vec3 color = mix(vec3(0.30, 0.045, 0.80), vec3(0.81, 0.44, 1.0), smoothstep(-4.0, 9.0, vHeight));
    color += vec3(0.28, 0.17, 0.30) * step(0.985, vSpark);
    float fog = 1.0 - smoothstep(35.0, 135.0, vDepth);
    float nearFade = smoothstep(0.0, 9.0, vDepth);
    gl_FragColor = vec4(color, glow * fog * nearFade * 0.92);
  }
`;

// Helsinki Cathedral stands in the terrain beside the intro stop (the camera
// starts at x 0, z 16 looking towards -z). It builds itself from dots once,
// when the app loads, and then stays in the landscape for the whole visit.
// Phones get it centred further back, since the screen is narrow.
const CATHEDRAL_WIDE = { x: 21, y: -4.4, z: -28, yaw: -0.62 };
const CATHEDRAL_COMPACT = { x: 3, y: -4.2, z: -40, yaw: -0.45 };
const INTRO = { x: 0, z: 16 };
const SCALE = 0.84; // design units (about 26 tall) to world units

// The cathedral's dots are drawn exactly like the terrain's: same size
// falloff, same height-based colour, same fog, and they share the terrain's
// idle swell, so the building reads as part of the landscape.
const cathedralVertex = `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aSeed;
  attribute float aWeight;
  uniform vec3 uOrigin;
  uniform vec2 uWorldPosition;
  uniform float uYaw;
  uniform float uReveal;
  uniform float uTime;
  uniform float uMotion;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vHeight;
  varying float vDepth;
  varying float vSpark;
  void main() {
    // Each dot leaves the square at its own delay (low parts first) and
    // drifts up into place.
    float t = clamp((uReveal - aDelay * 0.62) / 0.38, 0.0, 1.0);
    float e = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aStart, position, e);
    p.y += sin(e * 3.14159) * 1.2;
    float c = cos(uYaw), s = sin(uYaw);
    p = vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c) + uOrigin;
    // The terrain's idle motion: the same slow swell, plus a small bob.
    vec2 world = p.xz + uWorldPosition;
    p.y += sin(world.x * 0.11 + world.y * 0.08 + uTime * 0.55) * 0.3;
    p += vec3(sin(uTime * 0.47 + aSeed * 11.0), sin(uTime * 0.9 + aSeed * 6.3), cos(uTime * 0.39 + aSeed * 8.1)) * 0.04;
    float glitch = step(0.985, sin(uTime * 0.7)) * step(0.83, fract(sin(floor(p.z * 0.6) * 91.7 + floor(uTime * 9.0)) * 4375.5));
    p.x += glitch * sin(uTime * 70.0) * 0.75 * uMotion;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vHeight = p.y;
    vDepth = length(p.xz);
    vSpark = aSeed;
    vAlpha = smoothstep(0.0, 0.35, t) * aWeight;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((80.0 / max(5.0, -mv.z)) * uPixelRatio, 1.0 * uPixelRatio, 4.5 * uPixelRatio);
  }
`;
const cathedralFragment = `
  varying float vAlpha;
  varying float vHeight;
  varying float vDepth;
  varying float vSpark;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float glow = exp(-d * d * 3.8);
    vec3 color = mix(vec3(0.30, 0.045, 0.80), vec3(0.81, 0.44, 1.0), smoothstep(-4.0, 9.0, vHeight));
    color += vec3(0.28, 0.17, 0.30) * step(0.985, vSpark);
    float fog = 1.0 - smoothstep(35.0, 135.0, vDepth);
    gl_FragColor = vec4(color, glow * fog * vAlpha * 0.62);
  }
`;

export default function Terrain({ journey, paused }: TerrainProps) {
  const host = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(paused);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      dismissStartupLoader();
      setUnavailable(true);
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
    const compact = window.innerWidth < 768;
    const columns = compact ? 224 : 400;
    const rows = compact ? 224 : 400;
    const points = new Float32Array(columns * rows * 3);
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < columns; x++) {
        const index = (z * columns + x) * 3;
        points[index] = (x / columns) * 280;
        points[index + 2] = (z / rows) * 280;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uWorldPosition: { value: new THREE.Vector2(journey.current.x, journey.current.z) },
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uMotion: { value: 1 },
        uForward: { value: new THREE.Vector2(0, -1) },
        uPlaza: { value: new THREE.Vector4(0, 0, 0, 0) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const terrain = new THREE.Points(geometry, material);
    terrain.frustumCulled = false;
    scene.add(terrain);

    const CATHEDRAL = compact ? CATHEDRAL_COMPACT : CATHEDRAL_WIDE;
    // The side facing the intro camera is drawn brightest: express the
    // direction to the camera in the model's own (un-rotated) space.
    const toCameraX = INTRO.x - CATHEDRAL.x, toCameraZ = INTRO.z - CATHEDRAL.z;
    const yawCos = Math.cos(CATHEDRAL.yaw), yawSin = Math.sin(CATHEDRAL.yaw);
    const model = buildCathedral(compact ? 0.65 : 1, SCALE, [
      toCameraX * yawCos - toCameraZ * yawSin,
      toCameraX * yawSin + toCameraZ * yawCos,
    ]);
    const cathedralGeometry = new THREE.BufferGeometry();
    cathedralGeometry.setAttribute("position", new THREE.BufferAttribute(model.target, 3));
    cathedralGeometry.setAttribute("aStart", new THREE.BufferAttribute(model.start, 3));
    cathedralGeometry.setAttribute("aDelay", new THREE.BufferAttribute(model.delay, 1));
    cathedralGeometry.setAttribute("aSeed", new THREE.BufferAttribute(model.seed, 1));
    cathedralGeometry.setAttribute("aWeight", new THREE.BufferAttribute(model.weight, 1));
    const cathedralMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOrigin: { value: new THREE.Vector3() },
        uWorldPosition: { value: new THREE.Vector2() },
        uYaw: { value: CATHEDRAL.yaw },
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uMotion: { value: 1 },
        uPixelRatio: { value: 1 },
      },
      vertexShader: cathedralVertex,
      fragmentShader: cathedralFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cathedral = new THREE.Points(cathedralGeometry, cathedralMaterial);
    cathedral.frustumCulled = false;
    cathedral.visible = false;
    scene.add(cathedral);
    // The cathedral builds itself once, when the app loads, and then stays.
    let reveal = 0;
    let tagLevel = 0;

    // A small holographic tag that hangs beside the dome's cross.
    const tag = document.createElement("div");
    tag.className = "terrain-tag";
    tag.innerHTML = '<span class="terrain-tag-pin"></span><strong>Based in Helsinki</strong><span>60.17° N · 24.95° E</span>';
    container.appendChild(tag);
    const anchor = new THREE.Vector3();

    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    let needsRender = true;
    let wasPaused = false;
    const resize = () => {
      needsRender = true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      cathedralMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      setUnavailable(true);
    };
    const contextRestored = () => {
      needsRender = true;
      setUnavailable(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      contextRestored,
    );
    window.addEventListener("resize", resize);
    resize();
    let frame = 0;
    let firstFrame = true;
    let last = performance.now();
    let time = 0;
    let renderedVersion = -1;
    camera.rotation.order = "YXZ";
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!shouldRenderFrame(now)) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      const moving = !pauseRef.current;
      const pose = journey.current;
      // The tag only belongs to the intro view.
      const atIntro = Math.hypot(pose.x - INTRO.x, pose.z - INTRO.z) < 6 ? 1 : 0;
      const settling = reveal < 1 || tagLevel !== atIntro;
      if (!moving && wasPaused && !needsRender && !settling && pose.version === renderedVersion) return;
      wasPaused = !moving;
      needsRender = false;
      renderedVersion = pose.version;
      if (moving) time += dt;
      // The shared journey camera also positions the HTML chapter panels, so
      // the terrain and the panels always agree on where the camera is.
      (material.uniforms.uWorldPosition.value as THREE.Vector2).set(pose.x, pose.z);
      camera.position.set(0, pose.y, 0);
      camera.rotation.set(pose.pitch, -pose.heading, -pose.bank);
      (material.uniforms.uForward.value as THREE.Vector2).set(Math.sin(pose.heading), -Math.cos(pose.heading));
      material.uniforms.uTime.value = time;
      material.uniforms.uMotion.value = moving ? 1 : 0;

      // About two and a half seconds to build; with motion off it simply appears.
      reveal = moving ? Math.min(1, reveal + dt * 0.4) : 1;
      tagLevel = moving
        ? atIntro > tagLevel ? Math.min(1, tagLevel + dt * 2.5) : Math.max(0, tagLevel - dt * 4)
        : atIntro;
      cathedral.visible = reveal > 0;
      // The square levels out a little ahead of the building rising.
      (material.uniforms.uPlaza.value as THREE.Vector4).set(CATHEDRAL.x, CATHEDRAL.z, CATHEDRAL.y, Math.min(1, reveal * 2.5));
      if (cathedral.visible) {
        const origin = cathedralMaterial.uniforms.uOrigin.value as THREE.Vector3;
        origin.set(CATHEDRAL.x - pose.x, CATHEDRAL.y, CATHEDRAL.z - pose.z);
        cathedralMaterial.uniforms.uReveal.value = reveal;
        (cathedralMaterial.uniforms.uWorldPosition.value as THREE.Vector2).set(pose.x, pose.z);
        cathedralMaterial.uniforms.uTime.value = time;
        cathedralMaterial.uniforms.uMotion.value = moving ? 1 : 0;
        // Pin the tag beside the main cross (26 design units up).
        anchor.set(origin.x, origin.y + 26 * SCALE, origin.z);
        camera.updateMatrixWorld();
        anchor.project(camera);
        const shown = anchor.z < 1 ? Math.max(0, (reveal - 0.85) / 0.15) * tagLevel : 0;
        tag.style.opacity = shown.toFixed(3);
        tag.style.transform = `translate(${((anchor.x + 1) / 2) * window.innerWidth}px, ${((1 - anchor.y) / 2) * window.innerHeight}px)`;
      } else if (tag.style.opacity !== "0") {
        tag.style.opacity = "0";
      }
      renderer.render(scene, camera);
      if (firstFrame) {
        firstFrame = false;
        dismissStartupLoader();
      }
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      geometry.dispose();
      material.dispose();
      cathedralGeometry.dispose();
      cathedralMaterial.dispose();
      tag.remove();
      renderer.dispose();
      // Release the GL context now instead of waiting for garbage collection
      // (React StrictMode and remounts would otherwise stack live contexts).
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [journey]);

  return (
    <div
      className={`terrain ${unavailable ? "terrain-fallback" : ""}`}
      ref={host}
      aria-hidden="true"
    />
  );
}
