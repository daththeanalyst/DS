/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 2 — ISOSURFACE / MERCURY CHROME (ported from V25).
// Marching-cubes metaballs forming a liquid-chrome blob arrangement that
// morphs slowly into the logo silhouette over time. Cursor pulls one extra
// metaball. PBR chrome material — clearcoat + cool key + warm peach rim.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { sampleLogo } from "@/lib/logo-sampler";

const LOGO = "/logos/ds2-a.png";

export function AnimIsosurface() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf2f4f7,
      metalness: 0.95,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.2,
    });

    const cubes = new MarchingCubes(56, mat, true, true, 80000);
    cubes.scale.set(2.6, 2.6, 2.6);
    cubes.isolation = 80;
    scene.add(cubes);

    scene.add(new THREE.AmbientLight(0x1c2026, 0.55));
    const key = new THREE.DirectionalLight(0xc8e6ff, 1.1);
    key.position.set(4, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd9b8, 0.6);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    const logoTargets: { x: number; y: number; z: number }[] = [];
    sampleLogo(LOGO, { step: 6, threshold: 130, targetWidth: 200 }).then((s) => {
      const max = Math.min(s.count, 28);
      for (let i = 0; i < max; i++) {
        logoTargets.push({ x: (s.positions[i * 2] ?? 0) * 0.8, y: (s.positions[i * 2 + 1] ?? 0) * 0.4, z: 0 });
      }
    });

    const N = 18;
    const drift = Array.from({ length: N }, () => ({
      phase: Math.random() * Math.PI * 2,
      sX: 0.4 + Math.random() * 0.6,
      sY: 0.4 + Math.random() * 0.6,
      sZ: 0.3 + Math.random() * 0.4,
    }));

    const mouse = new THREE.Vector3(0, 0, 0);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    el.addEventListener("pointermove", onMove);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    let morph = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      // Slowly cycle morph between drift state and logo shape so user sees both.
      morph = 0.5 + 0.5 * Math.sin(t * 0.18);

      cubes.reset();
      for (let i = 0; i < N; i++) {
        const d = drift[i]!;
        const fx = 0.5 + 0.42 * Math.sin(d.phase + t * d.sX);
        const fy = 0.5 + 0.42 * Math.cos(d.phase + t * d.sY);
        const fz = 0.5 + 0.30 * Math.sin(d.phase + t * d.sZ);
        let x = fx, y = fy, z = fz;
        if (logoTargets.length && i < logoTargets.length) {
          const tg = logoTargets[i]!;
          x = THREE.MathUtils.lerp(fx, 0.5 + tg.x * 0.5, morph);
          y = THREE.MathUtils.lerp(fy, 0.5 + tg.y * 0.5, morph);
          z = THREE.MathUtils.lerp(fz, 0.5, morph);
        }
        cubes.addBall(x, y, z, 0.42, 12);
      }
      cubes.addBall(0.5 + mouse.x * 0.45, 0.5 + mouse.y * 0.45, 0.5, 0.3, 8);
      cubes.update();

      cubes.rotation.y = t * 0.12 + mouse.x * 0.4;
      cubes.rotation.x = mouse.y * 0.25;

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      mat.dispose();
      // cubes.material is the same `mat` we already disposed
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
