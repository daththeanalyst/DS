"use client";

// DS2 production hero animation — fisheye dot matrix.
// Ported from inspo-gallery V07 ("Fisheye Dot Matrix"). The dot grid samples
// brightness from the DS2 wordmark; the cursor lenses the grid through a
// radial bulge. Adapted to the DS Apple-Silicon palette: cool SF-blue glow,
// no warm/cool bichrome, restrained dot lightness.

import { useEffect, useRef } from "react";

const LOGO = "/logos/logo-white.png";

export function AnimFisheyeDots() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = host.clientWidth * dpr;
      canvas.height = host.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = -9999;
    let my = -9999;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (e.clientY - r.top) * dpr;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let disposed = false;
    let sampW = 0;
    let sampH = 0;
    let sampData: Uint8ClampedArray | null = null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      const samp = document.createElement("canvas");
      const ratio = img.width / img.height;
      samp.width = 512;
      samp.height = Math.max(1, Math.round(512 / ratio));
      const sctx = samp.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, samp.width, samp.height);
      sampW = samp.width;
      sampH = samp.height;
      sampData = sctx.getImageData(0, 0, samp.width, samp.height).data;
      raf = requestAnimationFrame(render);
    };
    img.src = LOGO;

    const render = () => {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      if (!sampData) return;

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const ratio = sampW / sampH;
      // Logo occupies ~58% of viewport height — leaves room for headline
      const fitH = ch * 0.58;
      const fitW = fitH * ratio;
      const ox = (cw - fitW) / 2;
      const oy = (ch - fitH) / 2;

      const COLS = 160;
      const ROWS = Math.max(1, Math.round(COLS / ratio));
      const stepX = fitW / COLS;
      const stepY = fitH / ROWS;

      const bulgeRadius = 220 * dpr;
      // Reduced-motion: skip the lens, render a static brightness grid
      const bulgeStrength = reducedMotion ? 0 : 1.6;

      for (let j = 0; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++) {
          const baseX = ox + i * stepX + stepX / 2;
          const baseY = oy + j * stepY + stepY / 2;
          const u = Math.min(sampW - 1, Math.floor((i / COLS) * sampW));
          const v = Math.min(sampH - 1, Math.floor((j / ROWS) * sampH));
          const idx = (v * sampW + u) * 4;
          const r0 = sampData[idx] ?? 0;
          const g0 = sampData[idx + 1] ?? 0;
          const b0 = sampData[idx + 2] ?? 0;
          const br = (r0 + g0 + b0) / (3 * 255);

          let nx = baseX;
          let ny = baseY;
          let near = 0;
          if (mx > -1000 && bulgeStrength > 0) {
            const ddx = baseX - mx;
            const ddy = baseY - my;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < bulgeRadius) {
              near = 1 - dd / bulgeRadius;
              const displace = Math.pow(near, 2) * bulgeStrength;
              nx = baseX + ddx * displace * 0.4;
              ny = baseY + ddy * displace * 0.4;
            }
          }

          // Dot size: brightness drives mass, cursor adds local emphasis
          const r = Math.max(0.4, br * 2.0 + near * 1.2) * dpr;

          // DS palette — single cool ramp.
          // - logo pixels (br > ~0.5): SF blue at high lightness
          // - background pixels: cool steel-gray at low lightness
          // - cursor proximity adds a small cool-white lift, not warmth
          const isLogo = br > 0.45;
          const hue = isLogo ? 199 : 215;
          const sat = isLogo ? 95 : 18;
          const light = (isLogo ? 60 : 28) + br * 18 + near * 14;
          const alpha = 0.22 + br * 0.78 + near * 0.18;
          ctx.fillStyle = `hsla(${hue},${sat}%,${light}%,${Math.min(1, alpha)})`;
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Subtle SF-blue cursor halo (replaces the original warm-orange ring)
      if (mx > -1000 && bulgeStrength > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, bulgeRadius);
        g.addColorStop(0, "hsla(199, 95%, 67%, 0.16)");
        g.addColorStop(1, "hsla(199, 95%, 67%, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cw, ch);
      }
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ touchAction: "pan-y" }} />;
}
