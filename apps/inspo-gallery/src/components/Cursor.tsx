import { useEffect, useRef, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

// DS2-logo cursor: a small floating logo follows the pointer instantly,
// a softer outer ghost lerps behind for a Vision-Pro-ish dual-element feel.
// Hidden on touch devices (no fine pointer = no cursor concept).
export const Cursor = () => {
  const sharpRef = useRef<HTMLImageElement>(null);
  const ghostRef = useRef<HTMLImageElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const sharp = sharpRef.current!;
    const ghost = ghostRef.current!;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let gx = x, gy = y;

    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    window.addEventListener("pointermove", move, { passive: true });

    let raf: number;
    const tick = () => {
      // Sharp follows instantly. Ghost lerps for the depth feel.
      gx += (x - gx) * 0.18;
      gy += (y - gy) * 0.18;
      // Sharp sits 14×14, anchor at (-7,-7). Ghost is 28×28, anchor (-14,-14).
      sharp.style.transform = `translate3d(${x - 7}px, ${y - 7}px, 0)`;
      ghost.style.transform = `translate3d(${gx - 14}px, ${gy - 14}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ghost: bigger, softer, lerps behind */}
      <img
        ref={ghostRef}
        src={logoWhite}
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 select-none opacity-30 blur-[1px]"
        style={{ filter: "drop-shadow(0 0 12px rgba(90,200,250,0.35))" }}
      />
      {/* Sharp: small, instant tracking */}
      <img
        ref={sharpRef}
        src={logoWhite}
        alt=""
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-3.5 w-3.5 select-none"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
      />
    </>
  );
};
