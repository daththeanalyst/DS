/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 3 — IRON FILINGS (ported from V13).
// Field-line streaks flow tangent to the logo's brightness gradient — they
// trace the letterforms like iron filings around a magnet. Cursor acts as a
// swirl pole. Pure Canvas 2D, no THREE.js, ultra-light.

import { useEffect, useRef } from "react";
import { sampleLogo } from "@/lib/logo-sampler";

const LOGO = "/logos/ds2-a.png";

const PARTICLE_COUNT = 1400;
const TRAIL_FADE = 0.06; // smaller = longer trails

export function AnimIronFilings() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = el.clientWidth * dpr;
      H = canvas.height = el.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let mouseX = -9999, mouseY = -9999, mouseActive = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * dpr;
      mouseY = (e.clientY - r.top) * dpr;
      mouseActive = 1;
    };
    const onLeave = () => { mouseActive = 0; mouseX = -9999; mouseY = -9999; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    type P = { x: number; y: number; vx: number; vy: number; life: number };
    const particles: P[] = [];

    let sample: { width: number; height: number; brightness: Uint8Array; aspect: number } | null = null;
    let logoOriginX = 0, logoOriginY = 0, logoScale = 1;

    sampleLogo(LOGO, { step: 1, threshold: 80, targetWidth: 800 }).then((s) => {
      sample = s;
      // Position the logo centered, sized to ~70% of screen height
      const screenH = H * 0.7;
      logoScale = screenH / s.height;
      logoOriginX = (W - s.width * logoScale) / 2;
      logoOriginY = (H - s.height * logoScale) / 2;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          life: Math.random(),
        });
      }
    });

    function logoGradAt(px: number, py: number): { gx: number; gy: number; b: number } {
      if (!sample) return { gx: 0, gy: 0, b: 0 };
      const w = sample.width, h = sample.height, br = sample.brightness;
      const sx = Math.floor((px - logoOriginX) / logoScale);
      const sy = Math.floor((py - logoOriginY) / logoScale);
      if (sx < 1 || sx > w - 2 || sy < 1 || sy > h - 2) {
        return { gx: 0, gy: 0, b: 0 };
      }
      const b = (br[sy * w + sx] ?? 0) / 255;
      const bL = (br[sy * w + (sx - 1)] ?? 0) / 255;
      const bR = (br[sy * w + (sx + 1)] ?? 0) / 255;
      const bU = (br[(sy - 1) * w + sx] ?? 0) / 255;
      const bD = (br[(sy + 1) * w + sx] ?? 0) / 255;
      return { gx: bR - bL, gy: bD - bU, b };
    }

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      // trail fade
      ctx.fillStyle = `rgba(6, 7, 10, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(150, 200, 245, 0.55)";
      ctx.lineWidth = 1.0 * dpr;
      ctx.lineCap = "round";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        // logo gradient pulls particles tangent to letterform edges
        const { gx, gy, b } = logoGradAt(p.x, p.y);
        // tangent direction (perpendicular to gradient) — flows along edges
        const tx = -gy, ty = gx;
        let ax = tx * 1.4 + gx * 0.3;
        let ay = ty * 1.4 + gy * 0.3;

        // cursor swirl
        if (mouseActive) {
          const dx = p.x - mouseX, dy = p.y - mouseY;
          const d2 = dx * dx + dy * dy;
          const r = Math.sqrt(d2);
          if (r < 280 * dpr) {
            const swirl = (1 - r / (280 * dpr)) * 1.6;
            ax += (-dy / (r + 0.001)) * swirl;
            ay += (dx / (r + 0.001)) * swirl;
          }
        }

        p.vx = p.vx * 0.86 + ax * 0.6;
        p.vy = p.vy * 0.86 + ay * 0.6;
        const nx = p.x + p.vx, ny = p.y + p.vy;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.globalAlpha = 0.30 + b * 0.55;
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.life -= 0.004;
        if (p.life <= 0 || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          // respawn near logo center
          p.x = logoOriginX + Math.random() * (sample?.width ?? 600) * logoScale;
          p.y = logoOriginY + Math.random() * (sample?.height ?? 240) * logoScale;
          p.vx = 0; p.vy = 0;
          p.life = 1;
        }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
