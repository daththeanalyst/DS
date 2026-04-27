// useScrollProgress.js
// Custom hook that tracks how far an element has scrolled through the viewport.
// Returns 0 while the section is below the viewport, grows linearly from 0..1
// as the section scrolls from "just-entered" to "about-to-leave", and stays 1 above.

import { useEffect, useRef, useState } from 'react';

export function useScrollProgress() {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let raf;
        const tick = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            // 0 when top of section is at bottom of viewport, 1 when bottom is at top
            const total = rect.height + vh;
            const travelled = vh - rect.top;
            const p = Math.min(1, Math.max(0, travelled / total));
            setProgress(p);
            // Active when any part of the section is in the viewport
            setActive(rect.bottom > -vh * 0.25 && rect.top < vh * 1.25);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return { ref, progress, active };
}
