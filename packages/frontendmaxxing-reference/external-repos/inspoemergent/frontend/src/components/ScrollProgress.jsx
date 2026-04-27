import { useEffect, useState } from 'react';

export const ScrollProgress = () => {
    const [p, setP] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const total = h.scrollHeight - h.clientHeight;
            const pp = total > 0 ? (window.scrollY / total) * 100 : 0;
            setP(pp);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <div className="fixed top-0 left-0 right-0 z-[9998] h-[2px] bg-transparent pointer-events-none">
            <div
                className="h-full bg-gradient-ember"
                style={{ width: `${p}%`, transition: 'width 0.1s linear' }}
            />
        </div>
    );
};

export default ScrollProgress;
