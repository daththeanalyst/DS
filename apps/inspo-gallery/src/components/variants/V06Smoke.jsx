// V06Smoke.jsx — particles flow like smoke; mouse pushes them aside, scroll resets density
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector3(-999, -999, 0), mouseAct: 0, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 13);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let mat, points, disposed = false;

        sampleLogo(LOGO, { step: 2, threshold: 130, targetWidth: 750 }).then((sample) => {
            if (disposed) return;
            const count = sample.count;
            const target = new Float32Array(count * 3);
            const offset = new Float32Array(count * 3); // smoke offset direction
            const color = new Float32Array(count * 3);
            const size = new Float32Array(count);
            const seed = new Float32Array(count);
            const SCALE = 13;
            const ember = new THREE.Color('hsl(22, 95%, 65%)');
            const frost = new THREE.Color('hsl(175, 80%, 60%)');
            const white = new THREE.Color('#fff5e8');
            for (let i = 0; i < count; i++) {
                const x = sample.positions[i * 2] * SCALE;
                const y = sample.positions[i * 2 + 1] * SCALE;
                target[i * 3] = x;
                target[i * 3 + 1] = y;
                target[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

                // each particle has a personal smoke trajectory
                const ang = Math.random() * Math.PI * 2;
                const lift = Math.random() * 4 + 2;
                offset[i * 3] = Math.cos(ang) * 0.6;
                offset[i * 3 + 1] = lift; // smoke rises
                offset[i * 3 + 2] = Math.sin(ang) * 0.6;

                const t = (x / SCALE + 0.5);
                const c = ember.clone().lerp(frost, t);
                if (Math.random() < 0.3) c.lerp(white, 0.6);
                color[i * 3] = c.r;
                color[i * 3 + 1] = c.g;
                color[i * 3 + 2] = c.b;

                size[i] = 0.05 + Math.random() * 0.07;
                seed[i] = Math.random();
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(target.slice(), 3));
            geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
            geo.setAttribute('aOffset', new THREE.BufferAttribute(offset, 3));
            geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
            geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

            mat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uProg: { value: 0 },
                    uMouse: { value: new THREE.Vector3() },
                    uStr: { value: 0 },
                    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: `
          attribute vec3 aTarget; attribute vec3 aOffset; attribute vec3 aColor;
          attribute float aSize; attribute float aSeed;
          uniform float uTime, uProg, uStr, uPixel; uniform vec3 uMouse;
          varying vec3 vC; varying float vA;
          void main(){
            // Total smoke factor = scroll-driven base + cursor push
            float disp = uProg * 0.35 + uStr;
            // Particle phase loops 0..1 with seed offset
            float phase = mod(uTime * 0.18 + aSeed, 1.0);
            // Cursor push factor based on distance
            vec3 dir = aTarget - uMouse;
            float md = length(dir.xy);
            float push = smoothstep(4.5, 0.0, md) * uStr;
            vec3 pos = aTarget;
            // smoke trails along aOffset, scaled by phase and disp
            pos += aOffset * disp * phase * 1.4;
            // sway
            pos.x += sin(uTime*0.8 + aSeed*8.) * 0.25 * disp;
            pos.z += cos(uTime*0.7 + aSeed*6.) * 0.25 * disp;
            // cursor push
            pos.xy += normalize(dir.xy + 0.0001) * push * 2.5;
            pos.z += push * 1.5;
            vec4 mv = modelViewMatrix * vec4(pos, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * 1100. * uPixel / -mv.z * (1.0 + disp * 0.6);
            vC = aColor;
            // Alpha fades as smoke trails up
            vA = (1.0 - phase) * 0.75 + 0.25;
            vA *= 1.0 - smoothstep(0.6, 1.0, disp) * 0.4;
            vA += push * 0.25;
          }`,
                fragmentShader: `
          varying vec3 vC; varying float vA;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0., d);
            a = pow(a, 2.0);
            gl_FragColor = vec4(vC * 1.1, a * vA);
            if (gl_FragColor.a < 0.005) discard;
          }`,
            });
            points = new THREE.Points(geo, mat);
            scene.add(points);
        });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 2 - 1;
            const y = -((e.clientY - r.top) / r.height) * 2 + 1;
            const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = v.sub(camera.position).normalize();
            const dist = -camera.position.z / dir.z;
            state.current.mouse.copy(camera.position).add(dir.multiplyScalar(dist));
            state.current.mouseAct = 1;
        };
        const onLeave = () => { state.current.mouseAct = 0; };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            if (mat) {
                mat.uniforms.uTime.value = t;
                mat.uniforms.uMouse.value.lerp(state.current.mouse, 0.22);
                mat.uniforms.uStr.value += (state.current.mouseAct - mat.uniforms.uStr.value) * 0.06;
                // scroll: increases smoke factor as you move through
                mat.uniforms.uProg.value = Math.abs(state.current.progress - 0.5) * 2;
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
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V06Smoke = () => (
    <VariantShell scrollable={true}
        index={6}
        title="Smoke Trails"
        technique="WebGL · Per-particle smoke trajectories"
        hint="hover to blow the smoke · scroll to release plumes"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V06Smoke;

V06Smoke.isTall = true;
