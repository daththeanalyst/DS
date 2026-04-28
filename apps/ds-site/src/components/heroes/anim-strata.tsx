/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 6 — STRATA / DEPTH LAYERS (ported from V33).
// Nine z-stacked logo planes at different depths, additive blending, parallax
// follows cursor. Slow breath. The cyan-to-cool-white gradient gives a sense
// of depth recession.

import { useEffect, useRef } from "react";
import * as THREE from "three";

const LOGO = "/logos/logo-white.png";
const LAYERS = 9;

export function AnimStrata() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
    cam.position.set(0, 0, 9);

    const logoTex = new THREE.TextureLoader().load(LOGO);
    logoTex.colorSpace = THREE.SRGBColorSpace;

    const baseW = 6, baseH = 6 * 0.4;
    const layers: { mesh: THREE.Mesh; depthIndex: number }[] = [];
    for (let i = 0; i < LAYERS; i++) {
      const t = i / (LAYERS - 1);
      const tint = new THREE.Color().lerpColors(
        new THREE.Color(0.35, 0.78, 0.98),
        new THREE.Color(0.85, 0.92, 0.98),
        t,
      );
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMap: { value: logoTex },
          uTint: { value: tint },
          uOpacity: { value: 0.35 + (1 - t) * 0.4 },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `varying vec2 vUv;
          uniform sampler2D uMap; uniform vec3 uTint; uniform float uOpacity;
          void main(){
            vec4 t = texture2D(uMap, vUv);
            if (t.a < 0.05) discard;
            gl_FragColor = vec4(uTint * 1.6, t.a * uOpacity);
          }`,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(baseW, baseH), mat);
      m.position.z = -i * 0.6;
      scene.add(m);
      layers.push({ mesh: m, depthIndex: t });
    }

    const mouse = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    el.addEventListener("pointermove", onMove);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      // separation pulses gently so depth reads even without cursor input
      const sep = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.25));
      layers.forEach(({ mesh, depthIndex }, i) => {
        const parallax = 1.0 - depthIndex;
        mesh.position.x = -mouse.x * parallax * 0.8;
        mesh.position.y = -mouse.y * parallax * 0.5;
        mesh.position.z = -i * sep;
        const breath = 1.0 + 0.025 * Math.sin(t * 0.6 + i * 0.4);
        mesh.scale.setScalar(breath);
      });
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      logoTex.dispose();
      layers.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
