// V12MarqueeMask.jsx — DS2 silhouette is a luminance mask. Behind it, large text marquees
// scroll horizontally with different speeds. Outside the mask, a frosted dim overlay.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const ROWS = [
    { text: '· DESIGN STUDIO 2 · CINEMATIC IDENTITIES · IMMERSIVE WEB · MOTION FORWARD ', size: 132, weight: 700, speed: 32, italic: false, color: 'hsl(36, 30%, 96%)', font: 'Space Grotesk' },
    { text: '· DS² · DS² · DS² · DS² · DS² · DS² · DS² · DS² · DS² · DS² · DS² · DS² · ', size: 200, weight: 900, speed: 26, italic: false, color: 'hsl(22, 95%, 60%)', font: 'Bebas Neue' },
    { text: '· webgl · instanced · shaders · parallax · physics · typography · cinematic ', size: 96, weight: 500, speed: 40, italic: true, color: 'hsl(175, 80%, 60%)', font: 'JetBrains Mono' },
    { text: '· EST 2026 · LOS ANGELES · REEL 026 · CINEMATIC · IMMERSIVE · ', size: 86, weight: 600, speed: 30, italic: false, color: 'hsl(36, 30%, 86%)', font: 'JetBrains Mono' },
    { text: '· DS² ✺ STUDIO ✺ DS² ✺ STUDIO ✺ DS² ✺ STUDIO ✺ DS² ✺ STUDIO ✺ ', size: 154, weight: 700, speed: 22, italic: false, color: 'hsl(28, 95%, 70%)', font: 'Bebas Neue' },
    { text: '· narrative · pixel · craft · brand · system · code · DS² · ', size: 110, weight: 400, speed: 36, italic: true, color: 'hsl(195, 80%, 70%)', font: 'Space Grotesk' },
];

const Scene = ({ progress, active }) => {
    const wrapRef = useRef(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const onMove = (e) => {
            const r = wrap.getBoundingClientRect();
            const mx = (e.clientX - r.left) / r.width - 0.5;
            const my = (e.clientY - r.top) / r.height - 0.5;
            wrap.style.setProperty('--mx', mx.toFixed(3));
            wrap.style.setProperty('--my', my.toFixed(3));
        };
        const onLeave = () => {
            wrap.style.setProperty('--mx', 0);
            wrap.style.setProperty('--my', 0);
        };
        wrap.addEventListener('mousemove', onMove);
        wrap.addEventListener('mouseleave', onLeave);
        return () => {
            wrap.removeEventListener('mousemove', onMove);
            wrap.removeEventListener('mouseleave', onLeave);
        };
    }, []);

    const Marquee = ({ children, opacity = 1 }) => (
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none" style={{ opacity }}>
            {children}
        </div>
    );

    const renderRows = (parallaxAmount) =>
        ROWS.map((row, i) => (
            <div
                key={i}
                className="whitespace-nowrap select-none flex"
                style={{
                    color: row.color,
                    fontFamily: `'${row.font}', sans-serif`,
                    fontSize: `${row.size}px`,
                    fontWeight: row.weight,
                    fontStyle: row.italic ? 'italic' : 'normal',
                    letterSpacing: row.font === 'Bebas Neue' ? '0.04em' : '-0.01em',
                    lineHeight: 0.95,
                    paddingTop: '0.06em',
                    paddingBottom: '0.06em',
                    transform: `translate3d(calc(var(--mx) * ${parallaxAmount}px), 0, 0)`,
                    willChange: 'transform',
                }}
            >
                <span
                    style={{
                        animation: `v12-scroll-${i} ${row.speed}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
                        paddingRight: '4em',
                        display: 'inline-block',
                    }}
                >
                    {row.text.repeat(8)}
                </span>
            </div>
        ));

    return (
        <div
            ref={wrapRef}
            className="absolute inset-0 overflow-hidden"
            style={{ '--mx': 0, '--my': 0 }}
        >
            {/* Background — dim version of marquees */}
            <Marquee opacity={0.08}>{renderRows(40)}</Marquee>

            {/* Foreground marquees — bright but masked to DS2 silhouette */}
            <div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage: `url(${LOGO})`,
                    WebkitMaskSize: '78% auto',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url(${LOGO})`,
                    maskSize: '78% auto',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                }}
            >
                <Marquee>{renderRows(60)}</Marquee>
                {/* subtle scanlines inside the mask */}
                <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, hsla(36, 30%, 96%, 0) 0px, hsla(36, 30%, 96%, 0) 2px, hsla(36, 30%, 96%, 0.05) 2px, hsla(36, 30%, 96%, 0.05) 3px)',
                    }}
                />
            </div>

            {/* Logo outline glow — sits over the mask edge to give it presence */}
            <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                    backgroundImage: `url(${LOGO})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '78% auto',
                    opacity: 0.25,
                    filter: 'blur(18px) brightness(1.6) hue-rotate(-10deg)',
                    transform: `translate3d(calc(var(--mx) * 18px), calc(var(--my) * 12px), 0)`,
                    transition: 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                }}
            />

            {/* Subtle ember edge shadow under the mask */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle at 50% 50%, transparent 0%, transparent 36%, hsla(225, 50%, 1%, 0.55) 80%)',
                }}
            />

            {/* Style — generate per-row keyframes with offset starts */}
            <style>{`
                ${ROWS.map(
                    (_, i) => `
                    @keyframes v12-scroll-${i} {
                        from { transform: translate3d(${i % 2 === 0 ? '0' : '-50%'}, 0, 0); }
                        to   { transform: translate3d(${i % 2 === 0 ? '-50%' : '0'}, 0, 0); }
                    }
                `
                ).join('\n')}
            `}</style>
        </div>
    );
};

export const V12MarqueeMask = () => (
    <VariantShell scrollable={true}
        index={12}
        title="Typographic Marquee Mask"
        technique="CSS mask · 6-row scrolling type · Mouse parallax"
        hint="hover to parallax · the logo is the window"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V12MarqueeMask;

V12MarqueeMask.isTall = true;
