"use client";

import { useEffect, useRef } from "react";

export function BackgroundFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const turb = turbRef.current;
    if (!canvas || !turb) return;

    // ── Animated SVG grain: reseed turbulence every frame for a living matte ──
    let grainSeed = 1;
    const tickGrain = () => {
      grainSeed = (grainSeed + 1) % 9999;
      turb.setAttribute("seed", String(grainSeed));
      // randomise frequency a touch so it shimmers, not strobes
      const f = 0.85 + Math.sin(grainSeed * 0.07) * 0.04;
      turb.setAttribute("baseFrequency", f.toFixed(3));
    };
    // Cap grain at ~24fps — plenty for liveness, lighter on CPU
    const grainInterval = window.setInterval(tickGrain, 42);

    // ── Slow dark waves: pure-black radial blobs drifting across the page ──
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      window.clearInterval(grainInterval);
      return;
    }
    let W = 0;
    let H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // 4 slow-moving "waves" — each a huge soft radial of either slightly-lighter
    // or slightly-darker black drifting on its own sine path.
    const waves = [
      { ax: 0.22, ay: 0.30, fx: 0.00012, fy: 0.00009, phx: 0.0, phy: 1.7, r: 900,  tone:  9 },
      { ax: 0.78, ay: 0.25, fx: 0.00009, fy: 0.00014, phx: 2.1, phy: 0.4, r: 1100, tone: -6 },
      { ax: 0.55, ay: 0.78, fx: 0.00011, fy: 0.00010, phx: 4.0, phy: 3.2, r: 1000, tone:  7 },
      { ax: 0.10, ay: 0.85, fx: 0.00008, fy: 0.00012, phx: 5.5, phy: 2.0, r: 950,  tone: -5 },
    ];

    let raf = 0;
    const step = (t: number) => {
      // Base matte fill so waves can layer over it
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, W, H);

      for (const w of waves) {
        const cx = (w.ax + Math.sin(t * w.fx + w.phx) * 0.35) * W;
        const cy = (w.ay + Math.cos(t * w.fy + w.phy) * 0.30) * H;
        const r = w.r;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const base = 10 + w.tone;
        const v = Math.max(2, Math.min(20, base));
        g.addColorStop(0,    `rgba(${v},${v},${v},0.55)`);
        g.addColorStop(0.55, `rgba(${v},${v},${v},0.18)`);
        g.addColorStop(1,    `rgba(${v},${v},${v},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      window.clearInterval(grainInterval);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas id="bgfx" ref={canvasRef} aria-hidden="true" />
      <svg id="grain" aria-hidden="true" preserveAspectRatio="none">
        <filter id="grainFilter">
          <feTurbulence
            ref={turbRef}
            id="grainTurb"
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            stitchTiles="stitch"
            seed={1}
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.045 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grainFilter)" />
      </svg>
    </>
  );
}
