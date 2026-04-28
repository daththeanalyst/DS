/* eslint-disable @typescript-eslint/ban-ts-comment, prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// @ts-nocheck — ported from inspo-gallery .jsx, complex THREE.js code that is bound-safe by construction; not worth fighting strict TS noUncheckedIndexedAccess for these.
"use client";

// Hero candidate 4 — ASCII RAIN (ported from V10).
// Monospaced glyphs drift across the screen; brightness sampled from the DS2
// logo controls which characters appear where. Cursor scrambles nearby chars.
// Pure Canvas 2D — no THREE.js, no shaders. Lightest of the candidates.

import { useEffect, useRef } from "react";
import { sampleLogo, sampleBrightness, type LogoSample } from "@/lib/logo-sampler";

const LOGO = "/logos/ds2-a.png";
const GLYPHS = " .:-=+*#%@";

export function AnimAsciiRain() {
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
    const cellSize = 14 * dpr;
    const resize = () => {
      W = canvas.width = el.clientWidth * dpr;
      H = canvas.height = el.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let mouseX = -9999, mouseY = -9999;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * dpr;
      mouseY = (e.clientY - r.top) * dpr;
    };
    const onLeave = () => { mouseX = -9999; mouseY = -9999; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let logoSample: LogoSample | null = null;
    sampleLogo(LOGO, { step: 1, threshold: 80, targetWidth: 600 }).then((s) => {
      logoSample = s;
    });

    let frame = 0;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      frame++;
      // background
      ctx.fillStyle = "rgba(6, 7, 10, 0.18)";
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${cellSize - 1}px ui-monospace, "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = Math.ceil(W / cellSize);
      const rows = Math.ceil(H / cellSize);
      // Map screen to logo via centered fit
      const logoW = W * 0.75;
      const logoOriginX = (W - logoW) / 2;
      const logoH = logoSample ? logoW / logoSample.aspect : 0;
      const logoOriginY = (H - logoH) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * cellSize + cellSize / 2;
          const py = r * cellSize + cellSize / 2;

          let brightness = 0;
          if (logoSample && logoH > 0) {
            const u = (px - logoOriginX) / logoW;
            const v = (py - logoOriginY) / logoH;
            if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
              brightness = sampleBrightness(logoSample, u, v) / 255;
            }
          }

          // cursor scramble
          let scramble = 0;
          if (mouseX > -1000) {
            const dx = px - mouseX, dy = py - mouseY;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 180 * dpr) scramble = 1 - d / (180 * dpr);
          }

          // animation: wavy noise
          const wave = 0.5 + 0.5 * Math.sin(frame * 0.02 + c * 0.3 + r * 0.5);
          const value = brightness * 0.85 + wave * 0.18 + scramble * 0.7;

          let glyphIdx = Math.floor(value * (GLYPHS.length - 1));
          if (scramble > 0.1) glyphIdx = Math.floor(Math.random() * GLYPHS.length);
          glyphIdx = Math.max(0, Math.min(GLYPHS.length - 1, glyphIdx));
          const glyph = GLYPHS[glyphIdx];
          if (!glyph || glyph === " ") continue;

          // SF-blue accent on logo pixels, dim gray elsewhere
          if (brightness > 0.08) {
            const a = Math.min(1, brightness * 1.4 + scramble * 0.6);
            ctx.fillStyle = `rgba(150, 200, 245, ${a})`;
          } else {
            const a = 0.20 + wave * 0.18 + scramble * 0.6;
            ctx.fillStyle = `rgba(140, 150, 165, ${a})`;
          }
          ctx.fillText(glyph, px, py);
        }
      }
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
