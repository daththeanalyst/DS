/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 5 — RAYMARCH / ETCHED GLASS (ported from V31).
// Pure GLSL fragment shader. Single rounded-box SDF with the DS2 logo
// texture etched into it via surface-normal-aware sampling. Refraction +
// Fresnel + warm peach specular. Camera orbits with cursor.

import { useEffect, useRef } from "react";
import * as THREE from "three";

const LOGO = "/logos/logo-white.png";

export function AnimRaymarch() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const logoTex = new THREE.TextureLoader().load(LOGO);
    logoTex.colorSpace = THREE.SRGBColorSpace;

    const mouse = new THREE.Vector2(0.5, 0.5);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
        uMouse: { value: mouse },
        uLogo: { value: logoTex },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution, uMouse;
        uniform sampler2D uLogo;

        float sdRoundBox(vec3 p, vec3 b, float r){
          vec3 d = abs(p) - b;
          return length(max(d, 0.)) + min(max(d.x, max(d.y, d.z)), 0.) - r;
        }
        float map(vec3 p){ return sdRoundBox(p, vec3(1.30, 0.55, 0.10), 0.06); }
        vec3 calcNormal(vec3 p){
          float h = 0.001; vec2 k = vec2(1., -1.);
          return normalize(
            k.xyy * map(p + k.xyy * h) +
            k.yyx * map(p + k.yyx * h) +
            k.yxy * map(p + k.yxy * h) +
            k.xxx * map(p + k.xxx * h));
        }
        float raymarch(vec3 ro, vec3 rd){
          float t = 0.;
          for (int i = 0; i < 80; i++){
            vec3 p = ro + rd * t;
            float d = map(p);
            if (d < 0.0008) return t;
            if (t > 8.) break;
            t += d * 0.85;
          }
          return -1.;
        }
        vec3 envColor(vec3 d){
          float h = clamp(d.y * 0.5 + 0.5, 0., 1.);
          vec3 sky = mix(vec3(0.025, 0.030, 0.038), vec3(0.18, 0.30, 0.42), pow(h, 1.5));
          sky += pow(max(0., dot(d, normalize(vec3(0.4, 0.6, 0.4)))), 80.) * vec3(1.0, 0.78, 0.55) * 0.35;
          return sky;
        }
        float sampleLogoAt(vec3 p, vec3 n){
          vec2 uv = vec2(p.x / 2.6 + 0.5, 1.0 - (p.y / 1.1 + 0.5));
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
          float face = smoothstep(0.4, 0.9, abs(n.z));
          vec4 t = texture2D(uLogo, uv);
          float lum = max(t.a, (t.r + t.g + t.b) / 3.0);
          return lum * face;
        }
        void main(){
          vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.) * 2.;
          float yaw = (uMouse.x - 0.5) * 1.0 + uTime * 0.05;
          float pitch = (uMouse.y - 0.5) * 0.4;
          vec3 ro = vec3(sin(yaw) * 3.6, sin(pitch) * 1.4, cos(yaw) * 3.6);
          vec3 forward = normalize(-ro);
          vec3 right = normalize(cross(vec3(0., 1., 0.), forward));
          vec3 up = cross(forward, right);
          vec3 rd = normalize(forward + uv.x * right + uv.y * up);
          float t = raymarch(ro, rd);
          vec3 col;
          if (t < 0.) col = envColor(rd) * 0.4;
          else {
            vec3 p = ro + rd * t;
            vec3 n = calcNormal(p);
            vec3 refr = refract(rd, n, 1.0 / 1.45);
            vec3 refl = reflect(rd, n);
            float fres = pow(1. - max(0., dot(-rd, n)), 3.5);
            col = mix(envColor(refr) * vec3(0.92, 0.96, 1.02), envColor(refl), fres);
            float logo = sampleLogoAt(p, n);
            col = mix(col, vec3(1.0), logo * 0.95);
            col += logo * vec3(0.20, 0.30, 0.40);
            col += pow(fres, 1.6) * vec3(0.35, 0.78, 0.98) * 0.30;
          }
          col *= 1.0 - 0.45 * length(uv) * 0.4;
          gl_FragColor = vec4(pow(col, vec3(0.95)), 1.);
        }`,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
    };
    el.addEventListener("pointermove", onMove);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      mat.uniforms.uResolution.value.set(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      mat.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      mat.dispose();
      logoTex.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
