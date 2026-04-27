import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import logoWhite from "@/assets/logo-white.png";
import logoBlack from "@/assets/logo-black.png";
import logoOutline from "@/assets/logo-outline.png";

/* ============================================================
   26 — RIBBONS  (3D bezier ribbons threading the logo)
============================================================ */
export const Section26 = () => {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });

  const ribbons = useMemo(
    () => Array.from({ length: 9 }, (_, i) => ({
      hue: (i * 40) % 360,
      offset: i * 0.11,
      amp: 80 + i * 14,
      width: 2 + (i % 3),
    })),
    []
  );

  const handleMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section
      className="snap-section relative overflow-hidden bg-[#07060d]"
      onMouseMove={handleMove}
    >
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top,#1a1130_0%,#000_70%)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          {ribbons.map((r, i) => (
            <linearGradient key={i} id={`rib-${i}`} x1="0" x2="1">
              <stop offset="0%" stopColor={`hsl(${r.hue}, 90%, 65%)`} stopOpacity="0" />
              <stop offset="50%" stopColor={`hsl(${r.hue}, 90%, 65%)`} stopOpacity="1" />
              <stop offset="100%" stopColor={`hsl(${(r.hue + 60) % 360}, 90%, 65%)`} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="rib-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {ribbons.map((r, i) => (
          <motion.path
            key={i}
            stroke={`url(#rib-${i})`}
            strokeWidth={r.width}
            fill="none"
            filter="url(#rib-glow)"
            initial={false}
            animate={{
              d: [
                `M -50 ${500 + r.amp} C 250 ${500 - r.amp}, 750 ${500 + r.amp}, 1050 ${500 - r.amp}`,
                `M -50 ${500 - r.amp} C 250 ${500 + r.amp}, 750 ${500 - r.amp}, 1050 ${500 + r.amp}`,
                `M -50 ${500 + r.amp} C 250 ${500 - r.amp}, 750 ${500 + r.amp}, 1050 ${500 - r.amp}`,
              ],
            }}
            transition={{ duration: 6 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: r.offset }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute inset-0 grid place-items-center"
        style={{
          x: useTransform(sx, (v) => (v - 0.5) * -40),
          y: useTransform(sy, (v) => (v - 0.5) * -40),
        }}
      >
        <img
          src={logoWhite}
          alt="DS2 ribbons"
          className="h-[34vmin] w-[34vmin] object-contain [filter:drop-shadow(0_0_30px_rgba(255,255,255,0.4))]"
        />
      </motion.div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-white/60">
        WOVEN — RIBBONS IN MOTION
      </div>
    </section>
  );
};

/* ============================================================
   27 — TYPEWRITER  (terminal — types ASCII manifesto)
============================================================ */
const MANIFESTO = [
  "> initiating ds2.systems",
  "> loading visual_identity.kernel ... OK",
  "> mounting /aesthetic ... OK",
  "> compiling 30 universes ... OK",
  "> ",
  "> we believe a logo is a verb.",
  "> it pulses. it folds. it shatters. it resets.",
  "> ",
  "> press ENTER to continue_",
];

export const Section27 = () => {
  const [lines, setLines] = useState<string[]>([""]);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => setActive(e.intersectionRatio > 0.5),
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      setLines([""]);
      setDone(false);
      return;
    }
    let li = 0, ci = 0;
    setLines([""]);
    const id = setInterval(() => {
      if (li >= MANIFESTO.length) {
        setDone(true);
        clearInterval(id);
        return;
      }
      const target = MANIFESTO[li];
      if (ci < target.length) {
        setLines((prev) => {
          const cp = [...prev];
          cp[li] = target.slice(0, ci + 1);
          return cp;
        });
        ci++;
      } else {
        li++;
        ci = 0;
        setLines((prev) => [...prev, ""]);
      }
    }, 28);
    return () => clearInterval(id);
  }, [active]);

  return (
    <section
      ref={ref}
      className="snap-section relative overflow-hidden bg-[#0a0f0a]"
    >
      {/* CRT scanlines + vignette */}
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,#0a3c1a22_0%,#000_85%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(0deg,#000_0,#000_2px,transparent_2px,transparent_4px)]" />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-5xl grid-cols-1 items-center gap-6 px-8 md:grid-cols-[1.2fr_1fr]">
        <div className="font-mono text-[clamp(11px,1.4vw,16px)] leading-[1.7] text-emerald-300">
          <div className="mb-3 flex items-center gap-2 text-emerald-400/70">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-[10px] tracking-widest opacity-60">ds2 ~ /boot</span>
          </div>
          {lines.map((l, i) => (
            <div key={i}>
              {l}
              {i === lines.length - 1 && !done && (
                <span className="ml-0.5 inline-block h-[1em] w-[0.55em] -mb-0.5 bg-emerald-300 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        <div className="relative grid place-items-center">
          <motion.img
            src={logoOutline}
            alt="DS2 terminal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: done ? 1 : 0.4, scale: done ? 1 : 0.92 }}
            transition={{ duration: 0.8 }}
            className="h-[36vmin] w-[36vmin] object-contain [filter:drop-shadow(0_0_22px_rgba(80,255,140,0.6))_brightness(0)_invert(70%)_sepia(80%)_saturate(500%)_hue-rotate(80deg)]"
          />
          {done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute bottom-2 font-mono text-[10px] tracking-[0.4em] text-emerald-300"
            >
              SYSTEM READY
            </motion.div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-emerald-400/60">
        TTY/01 — DS2.OS
      </div>
    </section>
  );
};

/* ============================================================
   28 — RAIN  (matrix-style logo rain with depth)
============================================================ */
export const Section28 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      c.width = c.clientWidth;
      c.height = c.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = 60;
    const drops = Array.from({ length: cols }, () => ({
      x: Math.random(),
      y: Math.random() * -1,
      v: 0.002 + Math.random() * 0.012,
      depth: Math.random(),
      glyph: "DS2".split("")[Math.floor(Math.random() * 3)],
    }));

    const tick = () => {
      const w = c.width, h = c.height;
      ctx.fillStyle = "rgba(0,0,4,0.18)";
      ctx.fillRect(0, 0, w, h);

      drops.forEach((d) => {
        d.y += d.v;
        if (d.y > 1.1) {
          d.y = -0.1;
          d.x = Math.random();
          d.depth = Math.random();
          d.v = 0.002 + Math.random() * 0.012;
        }
        const size = 8 + d.depth * 38;
        const alpha = 0.2 + d.depth * 0.8;
        ctx.font = `bold ${size}px ui-monospace, monospace`;
        ctx.fillStyle = `rgba(180,255,210,${alpha})`;
        ctx.shadowColor = "rgba(120,255,180,0.8)";
        ctx.shadowBlur = 14 * d.depth;
        ctx.fillText(d.glyph, d.x * w, d.y * h);

        // trailing echo
        for (let k = 1; k < 6; k++) {
          const a = alpha * (1 - k / 6) * 0.5;
          ctx.fillStyle = `rgba(120,255,180,${a})`;
          ctx.fillText(d.glyph, d.x * w, (d.y - k * 0.04) * h);
        }
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="snap-section relative overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.2 }}
          className="rounded-full border border-emerald-300/40 bg-black/60 p-10 backdrop-blur-md"
        >
          <img
            src={logoWhite}
            alt="DS2 rain"
            className="h-[28vmin] w-[28vmin] object-contain [filter:drop-shadow(0_0_24px_rgba(120,255,180,0.7))]"
          />
        </motion.div>
      </div>
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-emerald-300/60">
        DOWNPOUR — DS2 / DS2 / DS2
      </div>
    </section>
  );
};

/* ============================================================
   29 — CARDS  (deck shuffles into a fan, cursor parallax)
============================================================ */
export const Section29 = () => {
  const [hover, setHover] = useState<number | null>(null);
  const cards = Array.from({ length: 9 });

  return (
    <section className="snap-section relative overflow-hidden bg-gradient-to-br from-[#1a0a30] via-[#290e3e] to-[#0a0518]">
      {/* casino felt pattern */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.08)_0,transparent_30%),radial-gradient(circle_at_75%_75%,rgba(255,200,100,0.08)_0,transparent_30%)]" />

      <div className="relative z-10 grid h-full w-full place-items-center" style={{ perspective: 1600 }}>
        <div className="relative h-[60vmin] w-[80vmin]">
          {cards.map((_, i) => {
            const rel = i - (cards.length - 1) / 2;
            const baseRot = rel * 8;
            const baseX = rel * 60;
            const baseY = Math.abs(rel) * 8;
            const isH = hover === i;
            return (
              <motion.div
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                initial={{ x: 0, y: 200, rotate: 0, opacity: 0 }}
                whileInView={{ x: baseX, y: baseY, rotate: baseRot, opacity: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                animate={isH ? { y: baseY - 50, scale: 1.1, zIndex: 50 } : { y: baseY, scale: 1, zIndex: i }}
                transition={{ type: "spring", stiffness: 220, damping: 22, delay: i * 0.06 }}
                className="absolute left-1/2 top-1/2 -ml-[12vmin] -mt-[18vmin] h-[36vmin] w-[24vmin] rounded-2xl border border-white/15 shadow-2xl"
                style={{
                  background:
                    "linear-gradient(155deg, #fffbe6 0%, #f3e8c2 60%, #d8c382 100%)",
                  transformStyle: "preserve-3d",
                  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7), inset 0 0 0 6px rgba(0,0,0,0.04)",
                }}
              >
                <div className="absolute inset-3 rounded-xl border border-stone-900/30 p-3">
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-2xl text-stone-900">DS</span>
                    <span className="font-mono text-[10px] tracking-widest text-stone-700">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="absolute inset-0 grid place-items-center">
                    <img src={logoBlack} alt="DS2 card" className="h-[14vmin] w-[14vmin] object-contain" />
                  </div>
                  <div className="absolute bottom-3 right-3 rotate-180">
                    <span className="font-serif text-2xl text-stone-900">DS</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-amber-100/60">
        HOUSE OF DS2 — HOVER A CARD
      </div>
    </section>
  );
};

/* ============================================================
   30 — FINALE  (curtain call — kinetic mosaic of all logos)
============================================================ */
export const Section30 = () => {
  const cols = 16, rows = 9;
  const tiles = useMemo(
    () => Array.from({ length: cols * rows }, (_, i) => ({
      i,
      delay: ((i % cols) + Math.floor(i / cols)) * 0.04,
    })),
    []
  );
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => setRevealed(e.intersectionRatio > 0.5),
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="snap-section relative overflow-hidden bg-black">
      {/* spotlight */}
      <motion.div
        className="absolute inset-0 [background:radial-gradient(circle_at_50%_50%,rgba(255,240,200,0.18)_0%,transparent_55%)]"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* mosaic */}
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {tiles.map((t) => (
          <motion.div
            key={t.i}
            initial={{ opacity: 0, scale: 0.2, rotate: -30 }}
            animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: -30 }}
            transition={{ delay: t.delay, type: "spring", stiffness: 180, damping: 18 }}
            className="grid place-items-center"
          >
            <img
              src={t.i % 3 === 0 ? logoWhite : t.i % 3 === 1 ? logoOutline : logoWhite}
              alt=""
              aria-hidden
              className="h-[55%] w-[55%] object-contain opacity-70"
              style={{ filter: t.i % 5 === 0 ? "drop-shadow(0 0 10px #fff)" : "none" }}
            />
          </motion.div>
        ))}
      </div>

      {/* center hero */}
      <div className="relative z-10 grid h-full w-full place-items-center">
        <AnimatePresence>
          {revealed && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(24px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="text-center"
            >
              <div className="relative inline-block">
                <motion.img
                  src={logoWhite}
                  alt="DS2 finale"
                  className="h-[40vmin] w-[40vmin] object-contain"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 30px #fff) drop-shadow(0 0 60px #ff00aa)",
                      "drop-shadow(0 0 30px #fff) drop-shadow(0 0 60px #00ddff)",
                      "drop-shadow(0 0 30px #fff) drop-shadow(0 0 60px #ffaa00)",
                      "drop-shadow(0 0 30px #fff) drop-shadow(0 0 60px #ff00aa)",
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-8 font-mono text-[11px] tracking-[0.6em] text-white/80"
              >
                THIRTY UNIVERSES — ONE MARK
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "180px" }}
                transition={{ delay: 1.8, duration: 1 }}
                className="mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="mt-4 font-serif text-xs italic text-white/60"
              >
                — fin —
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-white/60">
        DS2 / 2026 — THANK YOU
      </div>
    </section>
  );
};
