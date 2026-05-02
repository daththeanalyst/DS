/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 1 — PARTICLE ASSEMBLY (ported from inspo-gallery V01).
// Particles fly in from a chaotic sphere and assemble into the DS2 logo, then
// hold the assembled shape. Cursor adds a soft repulsion field. Pure THREE.js,
// no external loaders.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sampleLogo } from "@/lib/logo-sampler";

const LOGO = "/logos/ds2-a.png";

export function AnimParticleAssembly() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    let raf = 0;
    let disposed = false;
    let points: THREE.Points | null = null;
    let material: THREE.ShaderMaterial | null = null;
    const mouse = new THREE.Vector3(-999, -999, 0);
    let mouseActive = 0;
    let assembleProgress = 0;

    sampleLogo(LOGO, { step: 2, threshold: 130, targetWidth: 750 }).then((sample) => {
      if (disposed) return;
      const count = sample.count;
      const target = new Float32Array(count * 3);
      const start = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const offsets = new Float32Array(count);

      const cool = new THREE.Color(0.35, 0.78, 0.98);
      const warm = new THREE.Color(0.95, 0.95, 0.98);
      const SCALE = 13;
      for (let i = 0; i < count; i++) {
        const x = (sample.positions[i * 2] ?? 0) * SCALE;
        const y = (sample.positions[i * 2 + 1] ?? 0) * SCALE;
        target[i * 3] = x;
        target[i * 3 + 1] = y;
        target[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

        const r = 30 + Math.random() * 40;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.random() * Math.PI;
        start[i * 3] = r * Math.sin(ph) * Math.cos(th);
        start[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        start[i * 3 + 2] = r * Math.cos(ph) - 18;

        const c = new THREE.Color().lerpColors(cool, warm, Math.random());
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = Math.random() * 0.05 + 0.05;
        offsets[i] = Math.random();
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(start.slice(), 3));
      geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
      geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
      geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));

      material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uMouse: { value: new THREE.Vector3() },
          uMouseStrength: { value: 0 },
          uPixel: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: `
          attribute vec3 aTarget; attribute vec3 aStart; attribute vec3 aColor;
          attribute float aSize; attribute float aOffset;
          uniform float uTime, uProgress, uMouseStrength, uPixel;
          uniform vec3 uMouse;
          varying vec3 vColor; varying float vAlpha;
          float ease(float t){ return t<0.5 ? 4.*t*t*t : 1.-pow(-2.*t+2.,3.)/2.; }
          void main(){
            float p = clamp(uProgress + (aOffset-0.5)*0.4, 0., 1.);
            float ep = ease(p);
            vec3 pos = mix(aStart, aTarget, ep);
            pos.x += sin(uTime*1.2 + aOffset*12.)*0.05*ep;
            pos.y += cos(uTime*1.4 + aOffset*10.)*0.05*ep;
            pos.z += sin(uTime*0.9 + aOffset*8.)*0.12*ep;
            vec3 dir = pos - uMouse;
            float d = length(dir.xy);
            float f = smoothstep(5.,0.,d) * uMouseStrength * ep;
            pos.xy += normalize(dir.xy + 0.0001) * f * 2.2;
            pos.z += f * 1.5;
            vec4 mv = modelViewMatrix * vec4(pos,1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * 460. * uPixel / -mv.z;
            vColor = aColor;
            vAlpha = ep;
          }`,
        fragmentShader: `
          varying vec3 vColor; varying float vAlpha;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0., d);
            a *= a;
            gl_FragColor = vec4(vColor * 1.05, a * vAlpha * 0.85);
            if (gl_FragColor.a < 0.01) discard;
          }`,
      });
      points = new THREE.Points(geo, material);
      scene.add(points);
    });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = -((e.clientY - r.top) / r.height) * 2 + 1;
      const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const target = camera.position.clone().add(dir.multiplyScalar(dist));
      mouse.copy(target);
      mouseActive = 1;
    };
    const onLeave = () => { mouseActive = 0; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      // Ease into the assembled state over ~2.5s, then HOLD at 1.0 forever.
      assembleProgress = Math.min(1, assembleProgress + clock.getDelta() * 0.45);
      if (material) {
        material.uniforms.uTime.value = t;
        material.uniforms.uProgress.value = assembleProgress;
        material.uniforms.uMouse.value.lerp(mouse, 0.2);
        material.uniforms.uMouseStrength.value += (mouseActive - material.uniforms.uMouseStrength.value) * 0.08;
      }
      if (points) {
        points.rotation.y = Math.sin(t * 0.2) * 0.05;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (material) material.dispose();
      if (points) {
        points.geometry.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
