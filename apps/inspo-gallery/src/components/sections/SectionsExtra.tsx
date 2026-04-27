import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import logoWhite from "@/assets/logo-white.png";
import logoOutline from "@/assets/logo-outline.png";

/* ============================================================
   11 — ASCII  (live ascii rendering of the logo)
============================================================ */
export const Section11 = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const [hover, setHover] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoWhite;
    let raf = 0;
    let t = 0;
    const RAMP = " .`'-:_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    const COLS = 110;

    img.onload = () => {
      const aspect = img.height / img.width;
      const ROWS = Math.floor(COLS * aspect * 0.5);
      const c = document.createElement("canvas");
      c.width = COLS;
      c.height = ROWS;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;

      const render = () => {
        t += 0.04;
        ctx.clearRect(0, 0, COLS, ROWS);
        ctx.drawImage(img, 0, 0, COLS, ROWS);
        const data = ctx.getImageData(0, 0, COLS, ROWS).data;
        let out = "";
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const i = (y * COLS + x) * 4;
            const a = data[i + 3] / 255;
            const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
            const dx = x / COLS - hover.x;
            const dy = y / ROWS - hover.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const wave = Math.sin(d * 30 - t * 4) * 0.5 + 0.5;
            const v = a > 0.1 ? lum * 0.6 + wave * 0.4 : wave * 0.15;
            const idx = Math.floor(v * (RAMP.length - 1));
            out += RAMP[idx] || " ";
          }
          out += "\n";
        }
        if (preRef.current) preRef.current.textContent = out;
        raf = requestAnimationFrame(render);
      };
      render();
    };

    return () => cancelAnimationFrame(raf);
  }, [hover]);

  return (
    <section
      className="snap-section flex items-center justify-center bg-background"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setHover({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08),transparent_70%)]" />
      <pre
        ref={preRef}
        className="font-mono text-[7px] leading-[7px] tracking-tighter text-foreground sm:text-[9px] sm:leading-[9px] md:text-[11px] md:leading-[11px]"
        style={{ textShadow: "0 0 12px hsl(var(--accent) / 0.5)" }}
      />
      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground">
        TEXT.MODE — MOVE CURSOR
      </div>
      <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-widest text-muted-foreground">
        90 CHAR RAMP
      </div>
    </section>
  );
};

/* ============================================================
   12 — MAGNETIC  (logo shards drawn to cursor)
============================================================ */
export const Section12 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0, active: false });
  // 6x6 grid of shards
  const shards = useMemo(() => {
    const arr = [];
    const N = 6;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        arr.push({ x, y, n: N });
      }
    }
    return arr;
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTick((t) => (t + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={containerRef}
      className="snap-section flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, hsl(280 60% 12%), hsl(0 0% 3%) 70%)" }}
      onMouseMove={(e) => {
        const r = containerRef.current!.getBoundingClientRect();
        mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
      }}
      onMouseLeave={() => (mouse.current.active = false)}
    >
      {/* Iron-filings field lines */}
      <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
        <defs>
          <radialGradient id="mag" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(320 100% 70%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={`${(i * 17) % 100}%`} cy={`${(i * 23) % 100}%`} r="1" fill="hsl(320 100% 80%)" opacity="0.4" />
        ))}
      </svg>

      <div className="relative h-[min(60vw,520px)] w-[min(60vw,520px)]">
        {shards.map((s, i) => {
          const cx = ((s.x + 0.5) / s.n) * 100;
          const cy = ((s.y + 0.5) / s.n) * 100;
          // distance from cursor
          const cont = containerRef.current;
          let dx = 0, dy = 0, dist = 9999;
          if (cont && mouse.current.active) {
            const r = cont.getBoundingClientRect();
            const cb = (cont.querySelector("[data-shardbox]") as HTMLElement)?.getBoundingClientRect();
            if (cb) {
              const px = cb.left - r.left + (cx / 100) * cb.width;
              const py = cb.top - r.top + (cy / 100) * cb.height;
              dx = mouse.current.x - px;
              dy = mouse.current.y - py;
              dist = Math.sqrt(dx * dx + dy * dy);
            }
          }
          const force = mouse.current.active ? Math.max(0, 1 - dist / 300) : 0;
          const tx = (dx / (dist || 1)) * force * 80;
          const ty = (dy / (dist || 1)) * force * 80;
          const rot = force * 30 * (i % 2 ? 1 : -1);
          // Hide tick warning
          void tick;
          return (
            <div
              key={i}
              data-shardbox={i === 0 ? "" : undefined}
              className="absolute overflow-hidden"
              style={{
                left: `${(s.x / s.n) * 100}%`,
                top: `${(s.y / s.n) * 100}%`,
                width: `${100 / s.n}%`,
                height: `${100 / s.n}%`,
                transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
                transition: "transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.4)",
                filter: force > 0.1 ? `drop-shadow(0 0 ${force * 20}px hsl(320 100% 70%))` : undefined,
              }}
            >
              <img
                src={logoWhite}
                alt=""
                className="absolute"
                style={{
                  width: `${s.n * 100}%`,
                  height: `${s.n * 100}%`,
                  left: `-${s.x * 100}%`,
                  top: `-${s.y * 100}%`,
                  maxWidth: "none",
                }}
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground">
        MAGNETIC.FIELD — REPULSION 80PX
      </div>
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[10px] tracking-widest text-muted-foreground">
        N · 36 SHARDS · S
      </div>
    </section>
  );
};

/* ============================================================
   13 — FLUID  (ink-in-water cursor trail)
============================================================ */
export const Section13 = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    type Drop = { x: number; y: number; r: number; life: number; max: number; vx: number; vy: number; hue: number };
    const drops: Drop[] = [];
    let mx = canvas.width / 2;
    let my = canvas.height / 2;
    let pmx = mx, pmy = my;

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (e.clientY - r.top) * dpr;
      const vx = mx - pmx;
      const vy = my - pmy;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const count = Math.min(6, Math.max(1, Math.floor(speed / 8)));
      for (let i = 0; i < count; i++) {
        drops.push({
          x: mx + (Math.random() - 0.5) * 20 * dpr,
          y: my + (Math.random() - 0.5) * 20 * dpr,
          r: (4 + Math.random() * 8) * dpr,
          life: 0,
          max: 80 + Math.random() * 60,
          vx: vx * 0.05 + (Math.random() - 0.5) * 0.4 * dpr,
          vy: vy * 0.05 + (Math.random() - 0.5) * 0.4 * dpr,
          hue: 180 + Math.random() * 80,
        });
      }
      pmx = mx; pmy = my;
    };
    canvas.addEventListener("mousemove", onMove);

    let raf = 0;
    const loop = () => {
      // fade trails (ink dispersion)
      ctx.fillStyle = "rgba(8, 8, 14, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life++;
        d.x += d.vx;
        d.y += d.vy;
        d.vx *= 0.985;
        d.vy *= 0.985;
        d.r += 0.4 * dpr;
        const a = Math.max(0, 1 - d.life / d.max);
        const grd = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
        grd.addColorStop(0, `hsla(${d.hue}, 100%, 65%, ${a * 0.6})`);
        grd.addColorStop(0.5, `hsla(${d.hue + 30}, 100%, 55%, ${a * 0.25})`);
        grd.addColorStop(1, `hsla(${d.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        if (d.life > d.max) drops.splice(i, 1);
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section className="snap-section flex items-center justify-center" style={{ background: "#08080e" }}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none relative z-10 flex flex-col items-center">
        <img
          ref={logoRef}
          src={logoOutline}
          alt="DS2"
          className="w-[min(50vw,560px)] mix-blend-screen"
          style={{ filter: "drop-shadow(0 0 30px hsl(200 100% 60% / 0.5))" }}
          draggable={false}
        />
      </div>
      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground">
        INK — DRAG CURSOR TO PAINT
      </div>
      <div className="pointer-events-none absolute left-8 top-8 font-mono text-[10px] tracking-widest text-muted-foreground">
        FLUID.SIM_v0.3
      </div>
    </section>
  );
};

/* ============================================================
   14 — DEPTH  (3D displacement / depth-map distortion via R3F)
============================================================ */
const DepthPlane = ({ texUrl }: { texUrl: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, mouse } = useThree();
  const tex = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const t = loader.load(texUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [texUrl]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [tex]
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
      matRef.current.uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.08);
    }
  });

  const w = Math.min(viewport.width * 0.7, 6);
  const h = w;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[w, h, 200, 200]} />
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform sampler2D uTex;
          void main() {
            vUv = uv;
            vec3 pos = position;
            vec4 t = texture2D(uTex, uv);
            float lum = (t.r + t.g + t.b) / 3.0 * t.a;
            float d = distance(uv, uMouse * 0.5 + 0.5);
            float ripple = sin(d * 22.0 - uTime * 3.0) * exp(-d * 4.0);
            pos.z += lum * 0.6 + ripple * 0.35;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTex;
          uniform float uTime;
          void main() {
            vec4 c = texture2D(uTex, vUv);
            float glow = smoothstep(0.0, 1.0, (c.r + c.g + c.b) / 3.0);
            vec3 col = mix(vec3(0.05, 0.4, 0.9), vec3(1.0, 0.3, 0.8), vUv.y);
            col = mix(col, vec3(1.0), glow * 0.6);
            gl_FragColor = vec4(col, c.a);
          }
        `}
      />
    </mesh>
  );
};

export const Section14 = () => {
  return (
    <section className="snap-section flex items-center justify-center" style={{ background: "linear-gradient(180deg, #050015 0%, #150033 100%)" }}>
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.5} />
          <DepthPlane texUrl={logoWhite} />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground">
        DEPTH.MAP — GLSL DISPLACEMENT
      </div>
      <div className="pointer-events-none absolute left-8 top-8 font-mono text-[10px] tracking-widest text-muted-foreground">
        Z-AXIS · RIPPLE · 200×200 VERTS
      </div>
    </section>
  );
};

/* ============================================================
   15 — TYPO  (kinetic typography — logo built from words)
============================================================ */
const WORDS = [
  "DESIGN", "MOTION", "BRAND", "SYSTEM", "FORM", "RHYTHM", "VOID", "SIGNAL",
  "CRAFT", "INDEX", "DS2", "MARK", "PIXEL", "VECTOR", "GRID", "FLUX",
  "EDGE", "FRAME", "TYPE", "ARC", "ECHO", "TONE", "PHASE", "DEPTH",
];

export const Section15 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={ref}
      className="snap-section flex items-center justify-center bg-background"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      }}
    >
      {/* Background streams of words */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        {Array.from({ length: 14 }).map((_, row) => (
          <div
            key={row}
            className="absolute whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] text-foreground"
            style={{
              top: `${(row / 14) * 100}%`,
              left: 0,
              animation: `marquee ${30 + row * 3}s linear infinite`,
              animationDirection: row % 2 ? "reverse" : "normal",
            }}
          >
            {Array.from({ length: 8 }).map((_, k) => (
              <span key={k} className="mx-6">
                {WORDS.slice((row + k) % WORDS.length).concat(WORDS).slice(0, 10).join(" · ")}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Logo masked by typography */}
      <div
        className="relative h-[min(70vw,640px)] w-[min(70vw,640px)]"
        style={{
          WebkitMaskImage: `url(${logoWhite})`,
          maskImage: `url(${logoWhite})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${pos.x * 100}% ${pos.y * 100}%, hsl(60 100% 60%), hsl(320 100% 60%) 35%, hsl(200 100% 60%) 70%, hsl(280 100% 50%))`,
          }}
        />
        {/* Cascading words inside the mask */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px] overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -40, opacity: 0 }}
              animate={revealed ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: i * 0.03, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-[14px] font-bold uppercase tracking-[0.2em] text-background mix-blend-difference"
              style={{ transform: `translateX(${Math.sin(i * 0.5 + pos.x * 6) * 12}px)` }}
            >
              {WORDS[i % WORDS.length]} · {WORDS[(i * 3 + 1) % WORDS.length]}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Outline echo */}
      <img
        src={logoOutline}
        alt="DS2"
        className="pointer-events-none absolute h-[min(70vw,640px)] w-[min(70vw,640px)] opacity-20 mix-blend-screen"
        style={{ transform: `translate(${(pos.x - 0.5) * 12}px, ${(pos.y - 0.5) * 12}px)` }}
      />

      <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground">
        TYPO.REVEAL — CASCADE
      </div>
      <div className="pointer-events-none absolute right-8 top-8 font-mono text-[10px] tracking-widest text-muted-foreground">
        24 LEXICON · 28 STREAMS
      </div>
    </section>
  );
};
