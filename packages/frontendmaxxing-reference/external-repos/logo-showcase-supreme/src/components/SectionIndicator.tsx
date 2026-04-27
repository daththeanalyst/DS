import { motion } from "framer-motion";

const SECTION_NAMES = [
  "GENESIS", "VOID", "PRISM", "FLUX", "BRUTAL",
  "AURORA", "PARTICLE", "KINETIC", "GLASS", "INFINITY",
  "ASCII", "MAGNETIC", "FLUID", "DEPTH", "TYPO",
  "VORTEX", "MORSE", "TOPO", "HOLO", "SHATTER",
  "CONSTELLATION", "FERRO", "ORIGAMI", "DATAMOSH", "TUNNEL",
  "RIBBONS", "TYPEWRITER", "RAIN", "CARDS", "FINALE",
];

interface Props {
  current: number;
  total: number;
  onJump: (i: number) => void;
}

export const SectionIndicator = ({ current, total, onJump }: Props) => {
  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-10">
        <div className="font-mono text-xs tracking-[0.3em] text-foreground">DS2 / 2026</div>
        <motion.div
          key={current}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs tracking-[0.3em] text-foreground"
        >
          {SECTION_NAMES[current]}
        </motion.div>
        <div className="font-mono text-xs tracking-[0.3em] text-foreground">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>

      {/* Side ticks */}
      <div className="pointer-events-auto fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`Section ${i + 1}`}
            className="group flex items-center gap-3"
          >
            <span className={`font-mono text-[10px] tracking-widest transition-all ${i === current ? "text-foreground opacity-100" : "text-foreground opacity-0 group-hover:opacity-60"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={`block h-px transition-all ${i === current ? "w-10 bg-foreground" : "w-5 bg-foreground/30 group-hover:bg-foreground/70"}`} />
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 mix-blend-difference">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-mono text-[10px] tracking-[0.4em] text-foreground"
        >
          ↓ SCROLL
        </motion.div>
      </div>
    </>
  );
};
