import { useEffect, useRef, useState } from "react";
import logoWhite from "@/assets/logo-white.png";

// DS2-logo cursor: a single well-sized logo follows the pointer.
// Crisp, no ghost, no blur — just a clean mark with a subtle shadow for
// legibility against any background. Hidden on touch devices.
export const Cursor = () => {
  const cursorRef = useRef<HTMLImageElement>(null);
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
    const cursor = cursorRef.current!;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;

    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; };
    window.addEventListener("pointermove", move, { passive: true });

    let raf: number;
    const tick = () => {
      // Anchor centred (cursor logo is 28px, so -14px on each axis)
      cursor.style.transform = `translate3d(${x - 14}px, ${y - 14}px, 0)`;
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
    <img
      ref={cursorRef}
      src={logoWhite}
      alt=""
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 select-none"
      style={{
        // Two-stop matte shadow for legibility on light + dark backgrounds.
        // No coloured glow — keeps it tech-clean.
        filter:
          "drop-shadow(0 1px 2px rgba(0,0,0,0.55)) drop-shadow(0 0 8px rgba(0,0,0,0.35))",
      }}
    />
  );
};
