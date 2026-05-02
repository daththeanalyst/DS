"use client";

// Sleek connected-particle network background — Vanta NET aesthetic, native
// three.js (no R3F). Particles drift inside a bounded volume; lines fade in
// between any pair within a distance threshold. Slow scene rotation gives
// gentle parallax. SF-blue palette, additive blending, dark base.

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";

const PARTICLE_COUNT = 110;
const BOX = { x: 26, y: 14, z: 12 };
const LINK_DISTANCE = 3.4;
const MAX_LINKS = 1800;
const POINT_COLOR = new Color("#7AC8FF");
const LINE_COLOR = new Color("#5AC8FA");

export function NetworkBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 16);

    // Particles — random initial positions + small velocities
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * BOX.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * BOX.y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * BOX.z;
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.012;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.012;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    const pointsGeom = new BufferGeometry();
    pointsGeom.setAttribute("position", new BufferAttribute(positions, 3));
    const pointsMat = new PointsMaterial({
      color: POINT_COLOR,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const points = new Points(pointsGeom, pointsMat);
    scene.add(points);

    // Lines — single LineSegments geometry whose vertex buffer is rewritten
    // each frame for the active connections. Pre-allocate the max we'll ever
    // draw so we never reallocate.
    const linePositions = new Float32Array(MAX_LINKS * 2 * 3);
    const lineColors = new Float32Array(MAX_LINKS * 2 * 3);
    const linesGeom = new BufferGeometry();
    linesGeom.setAttribute("position", new BufferAttribute(linePositions, 3));
    linesGeom.setAttribute("color", new BufferAttribute(lineColors, 3));
    linesGeom.setDrawRange(0, 0);
    const linesMat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const lines = new LineSegments(linesGeom, linesMat);
    scene.add(lines);

    // Pointer parallax — gentle, only ~5% of viewport in any axis
    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    host.addEventListener("pointermove", onMove);

    const onResize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let frame = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;

      // Drift particles + bounce inside the box
      if (!reducedMotion) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const ix = i * 3;
          const px = positions[ix]! + velocities[ix]!;
          const py = positions[ix + 1]! + velocities[ix + 1]!;
          const pz = positions[ix + 2]! + velocities[ix + 2]!;
          positions[ix] = px;
          positions[ix + 1] = py;
          positions[ix + 2] = pz;
          if (Math.abs(px) > BOX.x / 2) velocities[ix] = -velocities[ix]!;
          if (Math.abs(py) > BOX.y / 2) velocities[ix + 1] = -velocities[ix + 1]!;
          if (Math.abs(pz) > BOX.z / 2) velocities[ix + 2] = -velocities[ix + 2]!;
        }
        pointsGeom.attributes.position!.needsUpdate = true;
      }

      // Recompute connections — all-pairs, fade by distance
      let lineIdx = 0;
      const linkDistSq = LINK_DISTANCE * LINK_DISTANCE;
      for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINKS; i++) {
        const ax = positions[i * 3]!;
        const ay = positions[i * 3 + 1]!;
        const az = positions[i * 3 + 2]!;
        for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINKS; j++) {
          const bx = positions[j * 3]!;
          const by = positions[j * 3 + 1]!;
          const bz = positions[j * 3 + 2]!;
          const dx = ax - bx;
          const dy = ay - by;
          const dz = az - bz;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < linkDistSq) {
            const t = 1 - Math.sqrt(distSq) / LINK_DISTANCE;
            const off = lineIdx * 6;
            linePositions[off + 0] = ax;
            linePositions[off + 1] = ay;
            linePositions[off + 2] = az;
            linePositions[off + 3] = bx;
            linePositions[off + 4] = by;
            linePositions[off + 5] = bz;
            const r = LINE_COLOR.r * t;
            const g = LINE_COLOR.g * t;
            const b = LINE_COLOR.b * t;
            lineColors[off + 0] = r;
            lineColors[off + 1] = g;
            lineColors[off + 2] = b;
            lineColors[off + 3] = r;
            lineColors[off + 4] = g;
            lineColors[off + 5] = b;
            lineIdx++;
          }
        }
      }
      linesGeom.setDrawRange(0, lineIdx * 2);
      linesGeom.attributes.position!.needsUpdate = true;
      linesGeom.attributes.color!.needsUpdate = true;

      // Slow scene rotation + pointer parallax
      const t = frame * 0.001;
      const targetX = mouse.x * 0.6;
      const targetY = mouse.y * 0.4;
      points.rotation.y = lines.rotation.y = reducedMotion ? 0 : t * 0.08;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      host.removeEventListener("pointermove", onMove);
      pointsGeom.dispose();
      pointsMat.dispose();
      linesGeom.dispose();
      linesMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none bg-ink-950"
      style={{ touchAction: "pan-y" }}
    />
  );
}
