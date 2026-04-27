import { useEffect, useRef } from "react";

export const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;

    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    window.addEventListener("mousemove", move);

    let raf: number;
    const tick = () => {
      rx += (x - rx) * 0.15;
      ry += (y - ry) * 0.15;
      dot.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border border-foreground/60 mix-blend-difference transition-[width,height] duration-200" />
      <div ref={dotRef} className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-foreground mix-blend-difference" />
    </>
  );
};
