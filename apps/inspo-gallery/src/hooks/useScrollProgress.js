// useScrollProgress.js
// Custom hook that tracks how far an element has scrolled through the viewport.
// Returns 0 while the section is below the viewport, grows linearly from 0..1
// as the section scrolls from "just-entered" to "about-to-leave", and stays 1 above.

import { useEffect, useRef, useState } from 'react';

export function useScrollProgress() {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    const [active, setActive] = useState(false);

    const timer = useRef(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let raf;
        let lastTime = performance.now();

        const tick = (now) => {
            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;

            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            
            // Active when mostly in viewport
            const isActive = rect.bottom > vh * 0.2 && rect.top < vh * 0.8;
            setActive(isActive);

            if (isActive) {
                // Animate progress linearly from 0 to 1 over 2.5 seconds
                timer.current = Math.min(1.0, timer.current + dt * 0.4);
            } else {
                // Reset progress when section leaves view so it can replay
                timer.current = 0;
            }
            
            setProgress(timer.current);
            raf = requestAnimationFrame(tick);
        };
        // Kick off the loop. RAF passes its own timestamp into `tick`, so we
        // pass the function itself (NOT a timestamp — that's what was crashing
        // every variant: "parameter 1 is not of type 'Function'").
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return { ref, progress, active };
}
