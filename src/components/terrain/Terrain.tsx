import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import type { JourneyMotion } from "../../hooks/useJourneyMotion";

interface TerrainProps {
  travel: MutableRefObject<number>;
  paused: boolean;
  journey: MutableRefObject<JourneyMotion>;
}

const vertexShader = `
  uniform float uTravel;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uMotion;
  uniform float uHeading;
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
    p.z = mod(position.z + uTravel, 180.0) - 165.0;
    float worldZ = p.z - uTravel;
    vec2 samplePos = vec2(p.x * 0.052, worldZ * 0.041);
    float n = noise(samplePos) * 0.62 + noise(samplePos * 2.1) * 0.26 + noise(samplePos * 4.3) * 0.12;
    float valley = smoothstep(1.5, 26.0, abs(p.x));
    p.y = pow(n, 1.8) * 28.0 * valley - 5.0;
    p.y += sin(p.x * 0.18 + worldZ * 0.04) * 0.45;
    // Curve the open valley toward the destination, keeping nearby peaks
    // stable while the distant route leads the eye into the turn.
    p.x += uHeading * max(0.0, 16.0 - p.z) * smoothstep(0.0, 100.0, 16.0 - p.z);
    float glitch = step(0.985, sin(uTime * 0.7)) * step(0.83, noise(vec2(floor(p.z * 0.6), floor(uTime * 9.0))));
    p.x += glitch * sin(uTime * 70.0) * 0.75 * uMotion;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
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
    float fog = 1.0 - smoothstep(35.0, 165.0, vDepth);
    float nearFade = smoothstep(0.0, 9.0, vDepth);
    gl_FragColor = vec4(color, glow * fog * nearFade * 0.92);
  }
`;

export default function Terrain({ travel, journey, paused }: TerrainProps) {
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
      setUnavailable(true);
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);
    camera.position.set(0, 5.6, 16);
    const compact = window.innerWidth < 768;
    const columns = compact ? 190 : 320;
    const rows = compact ? 230 : 400;
    const points = new Float32Array(columns * rows * 3);
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < columns; x++) {
        const index = (z * columns + x) * 3;
        points[index] = (x / (columns - 1) - 0.5) * 145;
        points[index + 2] = (z / rows) * 180;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTravel: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uMotion: { value: 1 },
        uHeading: { value: journey.current.heading },
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
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        pointer.x = event.clientX / window.innerWidth - 0.5;
        pointer.y = event.clientY / window.innerHeight - 0.5;
      }
    };
    let needsRender = true;
    let wasPaused = false;
    const resize = () => {
      needsRender = true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
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
    window.addEventListener("pointermove", onPointer, { passive: true });
    resize();
    let frame = 0;
    let last = performance.now();
    let drift = 0;
    let smoothedTravel = travel.current * 37;
    let time = 0;
    let pointerOffset = 0;
    let heading = journey.current.heading;
    let bank = 0;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (document.hidden) return;
      const moving = !pauseRef.current;
      if (!moving && wasPaused && !needsRender) return;
      wasPaused = !moving;
      needsRender = false;
      if (moving) {
        time += dt;
        drift += dt * 1.65;
        smoothedTravel +=
          (travel.current * 37 - smoothedTravel) * (1 - Math.exp(-dt * 5));
        pointerOffset += (pointer.x * 1.7 - pointerOffset) * dt * 2;
        heading = journey.current.heading;
        bank = journey.current.bank;
        camera.position.x = heading * 9 + pointerOffset;
      }
      material.uniforms.uTravel.value = drift + smoothedTravel;
      material.uniforms.uTime.value = time;
      material.uniforms.uMotion.value = moving ? 1 : 0;
      material.uniforms.uHeading.value = heading;
      camera.lookAt(
        camera.position.x + Math.sin(heading) * 81,
        5.0 + (moving ? pointer.y * 0.35 : 0),
        camera.position.z - Math.cos(heading) * 81,
      );
      camera.rotateZ(-bank);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [travel, journey]);

  return (
    <div
      className={`terrain ${unavailable ? "terrain-fallback" : ""}`}
      ref={host}
      aria-hidden="true"
    />
  );
}
