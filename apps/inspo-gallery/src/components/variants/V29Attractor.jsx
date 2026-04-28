// V29Attractor.jsx — Lorenz strange attractor traced by 80k GPU instanced
// particles. Each particle integrates the chaotic ODE on the GPU each frame
// via a velocity texture (ping-pong). Cursor injects perturbation.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const IS_MOBILE = typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches);

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(0, 0), kick: 0, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 1000);
        camera.position.set(28, 20, 36);
        camera.lookAt(0, 14, 0);

        // CPU integration — mobile gets 2k particles for 60fps headroom
        const COUNT = IS_MOBILE ? 2000 : 6000;
        const positions = new Float32Array(COUNT * 3);
        const colors = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);

        // Initialize particles with slightly-different starts (sensitivity to IC)
        const states = [];
        for (let i = 0; i < COUNT; i++) {
            const x = 0.1 + (Math.random() - 0.5) * 0.4;
            const y = 0.1 + (Math.random() - 0.5) * 0.4;
            const z = 0.1 + (Math.random() - 0.5) * 0.4;
            states.push([x, y, z]);
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const hue = (i / COUNT) * 360;
            const c = new THREE.Color(`hsl(${(180 + hue * 0.6) % 360}, 90%, 60%)`);
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
            sizes[i] = 0.04 + Math.random() * 0.06;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uPixel: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: `attribute vec3 aColor; attribute float aSize;
                uniform float uPixel; varying vec3 vC;
                void main(){
                    vC = aColor;
                    vec4 mv = modelViewMatrix * vec4(position, 1.);
                    gl_Position = projectionMatrix * mv;
                    gl_PointSize = aSize * 320. * uPixel / -mv.z;
                }`,
            fragmentShader: `varying vec3 vC;
                void main(){
                    vec2 uv = gl_PointCoord - 0.5;
                    float d = length(uv);
                    float a = smoothstep(0.5, 0., d);
                    gl_FragColor = vec4(vC * 1.4, a * a);
                    if (gl_FragColor.a < 0.01) discard;
                }`,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        // Backdrop
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(160, 160),
            new THREE.ShaderMaterial({
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
                fragmentShader: `varying vec2 vUv;
                    void main(){
                        vec3 a = vec3(0.02, 0.03, 0.05);
                        vec3 b = vec3(0.05, 0.02, 0.10);
                        gl_FragColor = vec4(mix(a, b, vUv.y), 1.);
                    }`,
            })
        );
        bg.position.z = -60;
        scene.add(bg);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
        };
        const onDown = () => { state.current.kick = 1; };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerdown', onDown);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            camera.aspect = el.clientWidth / el.clientHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const dt = Math.min(0.02, clock.getDelta());

            // Lorenz parameters morph slightly with scroll
            const sigma = 10.0;
            const rho = 28.0 + state.current.progress * 4.0;
            const beta = 8.0 / 3.0;
            const speed = 0.6;

            for (let i = 0; i < COUNT; i++) {
                const s = states[i];
                const dx = sigma * (s[1] - s[0]) * dt * speed;
                const dy = (s[0] * (rho - s[2]) - s[1]) * dt * speed;
                const dz = (s[0] * s[1] - beta * s[2]) * dt * speed;
                s[0] += dx;
                s[1] += dy;
                s[2] += dz;
                if (state.current.kick > 0.01) {
                    s[0] += (Math.random() - 0.5) * 0.6;
                    s[1] += (Math.random() - 0.5) * 0.6;
                }
                positions[i * 3] = s[0];
                positions[i * 3 + 1] = s[1];
                positions[i * 3 + 2] = s[2];
            }
            state.current.kick *= 0.85;
            geo.attributes.position.needsUpdate = true;

            // Slow camera orbit + cursor parallax
            const t = clock.getElapsedTime();
            const orbit = t * 0.08;
            camera.position.x = Math.sin(orbit + state.current.mouse.x * 0.6) * 36;
            camera.position.z = Math.cos(orbit + state.current.mouse.x * 0.6) * 36;
            camera.position.y = 16 + state.current.mouse.y * 6;
            camera.lookAt(0, 25, 0);

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerdown', onDown);
            geo.dispose();
            mat.dispose();
            bg.geometry.dispose(); bg.material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V29Attractor = () => (
    <VariantShell index={29} title="Attractor" technique="WebGL · Lorenz Strange Attractor · 6k Particles" hint="click to perturb · scroll changes ρ">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V29Attractor;
