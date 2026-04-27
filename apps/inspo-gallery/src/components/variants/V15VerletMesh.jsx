// V15VerletMesh.jsx — A 2D Verlet spring mesh: particles sampled along the DS2
// outline, connected by springs. Cursor pulls a region; the elastic mesh recovers.
import { useEffect, useRef } from 'react';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const canvasRef = useRef(null);
    const state = useRef({ mx: -9999, my: -9999, prevMx: -9999, prevMy: -9999, mouseDown: false, t: 0, progress: 0, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let disposed = false, raf;
        let nodes = [];
        let springs = [];

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMove = (e) => {
            const r = canvas.getBoundingClientRect();
            state.current.mx = e.clientX - r.left;
            state.current.my = e.clientY - r.top;
        };
        const onLeave = () => {
            state.current.mx = -9999;
            state.current.my = -9999;
        };
        const onDown = () => { state.current.mouseDown = true; };
        const onUp = () => { state.current.mouseDown = false; };
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseleave', onLeave);
        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        sampleLogo(LOGO, { step: 9, threshold: 130, targetWidth: 700 }).then((s) => {
            if (disposed) return;
            // Build node positions in pixel space (centered)
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            const cw = canvas.width;
            const ch = canvas.height;
            const fitH = ch * 0.55;
            const fitW = fitH * s.aspect;
            const cx = cw / 2;
            const cy = ch / 2;

            nodes = [];
            for (let i = 0; i < s.count; i++) {
                const nx = s.positions[i * 2];
                const ny = s.positions[i * 2 + 1];
                const x = cx + nx * fitW;
                const y = cy - ny * fitW; // canvas y inverted
                nodes.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, px: x, py: y });
            }

            // Build springs: connect each node to its k-nearest neighbors
            const K = 4;
            // Spatial hash
            const cellSize = 20 * dpr;
            const cells = new Map();
            const keyAt = (x, y) => `${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`;
            nodes.forEach((n, idx) => {
                const k = keyAt(n.x, n.y);
                if (!cells.has(k)) cells.set(k, []);
                cells.get(k).push(idx);
            });

            const pairSet = new Set();
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const cellX = Math.floor(n.x / cellSize);
                const cellY = Math.floor(n.y / cellSize);
                const cands = [];
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const k = `${cellX + dx},${cellY + dy}`;
                        const arr = cells.get(k);
                        if (arr) cands.push(...arr);
                    }
                }
                // Sort by distance
                cands.sort((a, b) => {
                    const A = nodes[a], B = nodes[b];
                    return Math.hypot(A.x - n.x, A.y - n.y) - Math.hypot(B.x - n.x, B.y - n.y);
                });
                for (let kIdx = 1; kIdx <= Math.min(K, cands.length - 1); kIdx++) {
                    const j = cands[kIdx];
                    if (j === i) continue;
                    const a = Math.min(i, j), b = Math.max(i, j);
                    const key = `${a}-${b}`;
                    if (pairSet.has(key)) continue;
                    pairSet.add(key);
                    const len = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
                    if (len < cellSize * 1.6) {
                        springs.push({ a, b, len });
                    }
                }
            }
            start();
        });

        const start = () => {
            const render = () => {
                raf = requestAnimationFrame(render);
                if (!state.current.active) return;
                state.current.t += 0.016;
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                const cw = canvas.width, ch = canvas.height;
                ctx.fillStyle = 'rgba(7,9,15,0.45)';
                ctx.fillRect(0, 0, cw, ch);

                const mx = state.current.mx * dpr;
                const my = state.current.my * dpr;
                const cursorOn = state.current.mx > -100;
                const prog = state.current.progress;
                const pullR = 180 * dpr;
                const pullStrength = (state.current.mouseDown ? 7 : 3.2) * (0.6 + prog * 0.6);
                const restPullK = 0.06; // spring back to origin
                const damping = 0.86;

                // Verlet integration
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    // Cursor force (repel/swirl)
                    if (cursorOn) {
                        const dx = n.x - mx;
                        const dy = n.y - my;
                        const d2 = dx * dx + dy * dy;
                        if (d2 < pullR * pullR) {
                            const d = Math.sqrt(d2) + 0.001;
                            const k = (1 - d / pullR) * pullStrength;
                            // perpendicular swirl + radial repel
                            n.vx += (-dy / d) * k * 0.4 + (dx / d) * k * 0.6;
                            n.vy += (dx / d) * k * 0.4 + (dy / d) * k * 0.6;
                        }
                    }
                    // Restoring force toward origin
                    n.vx += (n.ox - n.x) * restPullK;
                    n.vy += (n.oy - n.y) * restPullK;
                    n.vx *= damping;
                    n.vy *= damping;
                    n.x += n.vx;
                    n.y += n.vy;
                }
                // Spring constraints (one pass of relaxation)
                for (let s = 0; s < springs.length; s++) {
                    const sp = springs[s];
                    const A = nodes[sp.a], B = nodes[sp.b];
                    const dx = B.x - A.x;
                    const dy = B.y - A.y;
                    const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
                    const diff = (d - sp.len) / d * 0.4;
                    const ox = dx * diff * 0.5;
                    const oy = dy * diff * 0.5;
                    A.x += ox; A.y += oy;
                    B.x -= ox; B.y -= oy;
                }

                // Draw springs
                ctx.lineWidth = 1 * dpr;
                for (let s = 0; s < springs.length; s++) {
                    const sp = springs[s];
                    const A = nodes[sp.a], B = nodes[sp.b];
                    const stretch = Math.hypot(A.x - B.x, A.y - B.y) / sp.len;
                    const tension = Math.min(1, Math.abs(stretch - 1) * 1.6);
                    const hue = 22 + tension * 130; // ember to teal
                    const alpha = 0.18 + tension * 0.7;
                    ctx.strokeStyle = `hsla(${hue}, 90%, ${55 + tension * 25}%, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(A.x, A.y);
                    ctx.lineTo(B.x, B.y);
                    ctx.stroke();
                }
                // Draw nodes
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i];
                    const stretch = Math.hypot(n.vx, n.vy);
                    const r = (1.2 + Math.min(2.5, stretch * 0.4)) * dpr;
                    ctx.fillStyle = stretch > 0.6
                        ? `hsla(22, 95%, 65%, 0.95)`
                        : `hsla(36, 50%, 92%, 0.85)`;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                    ctx.fill();
                }

                // cursor glow ring
                if (cursorOn) {
                    ctx.strokeStyle = state.current.mouseDown
                        ? 'hsla(22, 95%, 60%, 0.85)'
                        : 'hsla(22, 95%, 60%, 0.35)';
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.beginPath();
                    ctx.arc(mx, my, pullR, 0, Math.PI * 2);
                    ctx.stroke();
                }
            };
            raf = requestAnimationFrame(render);
        };

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mouseup', onUp);
            canvas.removeEventListener('mousemove', onMove);
            canvas.removeEventListener('mouseleave', onLeave);
            canvas.removeEventListener('mousedown', onDown);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export const V15VerletMesh = () => (
    <VariantShell
        index={15}
        title="Verlet Spring Mesh"
        technique="Canvas 2D · Verlet integration · Spring constraints"
        hint="drag through the mesh · hold for stronger pull"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V15VerletMesh;

