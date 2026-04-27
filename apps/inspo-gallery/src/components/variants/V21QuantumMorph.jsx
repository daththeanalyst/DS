// V21QuantumMorph.jsx — 100k particles seamlessly morphing between all 3 DS2 logo frames
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

import logoOutline from '@/assets/logo-outline.png';
import logoBlack from '@/assets/logo-black.png';
import logoWhite from '@/assets/logo-white.png';

const Scene = ({ active }) => {
    const mount = useRef(null);
    const state = useRef({ active: false, time: 0 });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 15);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let points, material, disposed = false;

        const options = { step: 2, threshold: 100, targetWidth: 800 };
        Promise.all([
            sampleLogo(logoOutline, options),
            sampleLogo(logoBlack, options),
            sampleLogo(logoWhite, options)
        ]).then(([sampOutline, sampBlack, sampWhite]) => {
            if (disposed) return;
            const maxCount = Math.max(sampOutline.count, sampBlack.count, sampWhite.count);
            
            const start = new Float32Array(maxCount * 3);
            const targetOutline = new Float32Array(maxCount * 3);
            const targetBlack = new Float32Array(maxCount * 3);
            const targetWhite = new Float32Array(maxCount * 3);
            const sizes = new Float32Array(maxCount);
            const randoms = new Float32Array(maxCount);

            const SCALE = 14;

            const getPos = (samp, i) => {
                const idx = i % samp.count;
                return {
                    x: samp.positions[idx * 2] * SCALE,
                    y: samp.positions[idx * 2 + 1] * SCALE,
                    z: (Math.random() - 0.5) * 0.4
                };
            };

            for (let i = 0; i < maxCount; i++) {
                // Starting chaotic positions
                const r = 40 + Math.random() * 40;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.random() * Math.PI;
                start[i * 3] = r * Math.sin(ph) * Math.cos(th);
                start[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
                start[i * 3 + 2] = r * Math.cos(ph) - 10;

                const tO = getPos(sampOutline, i);
                targetOutline[i * 3] = tO.x;
                targetOutline[i * 3 + 1] = tO.y;
                targetOutline[i * 3 + 2] = tO.z;

                const tB = getPos(sampBlack, i);
                targetBlack[i * 3] = tB.x;
                targetBlack[i * 3 + 1] = tB.y;
                targetBlack[i * 3 + 2] = tB.z;

                const tW = getPos(sampWhite, i);
                targetWhite[i * 3] = tW.x;
                targetWhite[i * 3 + 1] = tW.y;
                targetWhite[i * 3 + 2] = tW.z;

                sizes[i] = Math.random() * 0.05 + 0.03;
                randoms[i] = Math.random();
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
            geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
            geo.setAttribute('aTargetO', new THREE.BufferAttribute(targetOutline, 3));
            geo.setAttribute('aTargetB', new THREE.BufferAttribute(targetBlack, 3));
            geo.setAttribute('aTargetW', new THREE.BufferAttribute(targetWhite, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            geo.setAttribute('aRand', new THREE.BufferAttribute(randoms, 1));

            material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uPhase: { value: 0 }, // 0: start, 1: Outline, 2: Black, 3: White
                    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: `
                    attribute vec3 aStart; 
                    attribute vec3 aTargetO; 
                    attribute vec3 aTargetB; 
                    attribute vec3 aTargetW;
                    attribute float aSize; 
                    attribute float aRand;
                    uniform float uTime, uPhase, uPixel;
                    varying float vAlpha;
                    varying vec3 vColor;

                    float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
                    float easeOutExp(float t) { return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t); }

                    void main(){
                        // Morph logic based on uPhase
                        vec3 pos = aStart;
                        float p1 = clamp((uPhase - 0.0) * 1.5 - aRand * 0.5, 0.0, 1.0); // Start -> Outline
                        float p2 = clamp((uPhase - 1.0) * 2.0 - aRand * 0.5, 0.0, 1.0); // Outline -> Black
                        float p3 = clamp((uPhase - 2.0) * 2.0 - aRand * 0.5, 0.0, 1.0); // Black -> White

                        pos = mix(pos, aTargetO, ease(p1));
                        pos = mix(pos, aTargetB, easeOutExp(p2));
                        pos = mix(pos, aTargetW, easeOutExp(p3));

                        // Add subtle noise/floating when assembled
                        float activeP = p1 - p2 + p3; 
                        pos.x += sin(uTime * 1.2 + aRand * 10.0) * 0.05 * activeP;
                        pos.y += cos(uTime * 1.5 + aRand * 10.0) * 0.05 * activeP;
                        pos.z += sin(uTime * 0.8 + aRand * 10.0) * 0.1 * activeP;

                        // Colors based on phase
                        vec3 cOutline = vec3(0.5, 0.8, 1.0);
                        vec3 cBlack = vec3(1.0, 0.3, 0.1);
                        vec3 cWhite = vec3(1.0, 1.0, 1.0);
                        vec3 color = mix(cOutline, cBlack, p2);
                        color = mix(color, cWhite, p3);
                        vColor = color;

                        // Shockwave flash effect
                        float flash2 = smoothstep(0.0, 0.2, p2) * smoothstep(0.5, 0.2, p2);
                        float flash3 = smoothstep(0.0, 0.2, p3) * smoothstep(0.5, 0.2, p3);
                        vAlpha = clamp(p1 + flash2 * 2.0 + flash3 * 2.0, 0.2, 1.0);

                        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                        gl_Position = projectionMatrix * mv;
                        gl_PointSize = aSize * (500.0 + flash2*500.0 + flash3*500.0) * uPixel / -mv.z;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor; varying float vAlpha;
                    void main(){
                        vec2 uv = gl_PointCoord - 0.5;
                        float d = length(uv);
                        float a = smoothstep(0.5, 0.1, d);
                        gl_FragColor = vec4(vColor, a * vAlpha);
                    }
                `,
            });
            points = new THREE.Points(geo, material);
            scene.add(points);
        });

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            if (material) {
                material.uniforms.uTime.value = t;
                // Timeline: 
                // 0s-0.5s: stay chaotic
                // 0.5s-2.0s: phase 0 -> 1 (Assemble Outline)
                // 2.5s-3.5s: phase 1 -> 2 (Flash to Black DS)
                // 4.0s-5.0s: phase 2 -> 3 (Final White 2)
                state.current.time += clock.getDelta();
                const st = state.current.time;
                let phase = 0;
                if (st > 0.5 && st < 2.0) phase = (st - 0.5) / 1.5;
                if (st >= 2.0 && st < 2.5) phase = 1.0;
                if (st >= 2.5 && st < 3.5) phase = 1.0 + (st - 2.5);
                if (st >= 3.5 && st < 4.0) phase = 2.0;
                if (st >= 4.0 && st < 5.0) phase = 2.0 + (st - 4.0);
                if (st >= 5.0) phase = 3.0;

                material.uniforms.uPhase.value = phase;
            }
            if (points) {
                // Slow dramatic rotation
                points.rotation.y = Math.sin(t * 0.1) * 0.1;
                points.rotation.x = Math.cos(t * 0.15) * 0.05;
            }
            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        const onResize = () => {
            camera.aspect = el.clientWidth / el.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(el.clientWidth, el.clientHeight);
        };
        window.addEventListener('resize', onResize);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    // Reset animation when section becomes active again
    useEffect(() => {
        state.current.active = active;
        if (active) state.current.time = 0; // Trigger sequence!
    }, [active]);

    return <div ref={mount} className="absolute inset-0" />;
};

export const V21QuantumMorph = () => (
    <VariantShell
        index={21}
        title="Quantum Morph"
        technique="WebGL · Particle Engine · Timeline Shockwaves"
        hint="snaps into place as you enter the section"
    >
        {({ active }) => <Scene active={active} />}
    </VariantShell>
);

export default V21QuantumMorph;
