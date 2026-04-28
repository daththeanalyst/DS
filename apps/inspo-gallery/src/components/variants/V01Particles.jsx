// V01Particles.jsx — DS2 particles assemble from chaos, mouse repulsion field
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector3(-999, -999, 0), mouseActive: 0 });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 14);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let points, material, disposed = false;

        sampleLogo(LOGO, { step: 2, threshold: 130, targetWidth: 750 }).then((sample) => {
            if (disposed) return;
            const count = sample.count;
            const target = new Float32Array(count * 3);
            const start = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const offsets = new Float32Array(count);

            const ember = new THREE.Color('hsl(22, 95%, 60%)');
            const frost = new THREE.Color('hsl(175, 85%, 60%)');
            const white = new THREE.Color('#fff8ee');
            const SCALE = 13;
            for (let i = 0; i < count; i++) {
                const x = sample.positions[i * 2] * SCALE;
                const y = sample.positions[i * 2 + 1] * SCALE;
                target[i * 3] = x;
                target[i * 3 + 1] = y;
                target[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

                const r = 30 + Math.random() * 40;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.random() * Math.PI;
                start[i * 3] = r * Math.sin(ph) * Math.cos(th);
                start[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
                start[i * 3 + 2] = r * Math.cos(ph) - 18;

                const t = (x / SCALE + 0.5);
                const c = new THREE.Color().lerpColors(ember, frost, Math.max(0, Math.min(1, t)));
                if (Math.random() < 0.12) c.lerp(white, 0.8);
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;

                sizes[i] = Math.random() * 0.05 + 0.05;
                offsets[i] = Math.random();
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
            geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
            geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
            geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

            material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uProgress: { value: 0 },
                    uMouse: { value: new THREE.Vector3() },
                    uMouseStrength: { value: 0 },
                    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: `
          attribute vec3 aTarget; attribute vec3 aStart; attribute vec3 aColor;
          attribute float aSize; attribute float aOffset;
          uniform float uTime, uProgress, uMouseStrength, uPixel;
          uniform vec3 uMouse;
          varying vec3 vColor; varying float vAlpha;
          float ease(float t){ return t<0.5 ? 4.*t*t*t : 1.-pow(-2.*t+2.,3.)/2.; }
          void main(){
            float p = clamp(uProgress + (aOffset-0.5)*0.4, 0., 1.);
            float ep = ease(p);
            vec3 pos = mix(aStart, aTarget, ep);
            pos.x += sin(uTime*1.2 + aOffset*12.)*0.05*ep;
            pos.y += cos(uTime*1.4 + aOffset*10.)*0.05*ep;
            pos.z += sin(uTime*0.9 + aOffset*8.)*0.12*ep;
            vec3 dir = pos - uMouse;
            float d = length(dir.xy);
            float f = smoothstep(5.,0.,d) * uMouseStrength * ep;
            pos.xy += normalize(dir.xy + 0.0001) * f * 2.2;
            pos.z += f * 1.5;
            vec4 mv = modelViewMatrix * vec4(pos,1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * 460. * uPixel / -mv.z;
            vColor = aColor;
            vAlpha = ep;
          }`,
                fragmentShader: `
          varying vec3 vColor; varying float vAlpha;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0., d);
            a *= a;
            gl_FragColor = vec4(vColor * 1.2, a * vAlpha);
            if (gl_FragColor.a < 0.01) discard;
          }`,
            });
            points = new THREE.Points(geo, material);
            scene.add(points);
        });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 2 - 1;
            const y = -((e.clientY - r.top) / r.height) * 2 + 1;
            const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = v.sub(camera.position).normalize();
            const dist = -camera.position.z / dir.z;
            const target = camera.position.clone().add(dir.multiplyScalar(dist));
            state.current.mouse.copy(target);
            state.current.mouseActive = 1;
        };
        const onLeave = () => { state.current.mouseActive = 0; };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            if (material) {
                material.uniforms.uTime.value = t;
                // Scroll drives assembly with a long held-shape plateau in the middle:
                //   0.00–0.20: assemble (chaos → logo)
                //   0.20–0.85: hold the assembled shape (the visually nicest beat)
                //   0.85–1.00: gentle disperse
                const pr = state.current.progress ?? 0;
                let assembly;
                if (pr < 0.20) assembly = pr * 5;            // 0 → 1 quickly
                else if (pr < 0.85) assembly = 1;            // long plateau
                else assembly = 1 - (pr - 0.85) * 2;         // 1 → 0.7
                material.uniforms.uProgress.value = Math.max(0, Math.min(1, assembly));
                material.uniforms.uMouse.value.lerp(state.current.mouse, 0.2);
                material.uniforms.uMouseStrength.value +=
                    (state.current.mouseActive - material.uniforms.uMouseStrength.value) * 0.08;
            }
            if (points) {
                points.rotation.y = Math.sin(t * 0.2) * 0.05;
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
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerleave', onLeave);
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    // reflect latest progress into state for the tick closure
    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V01Particles = () => (
    <VariantShell
        index={1}
        title="Particle Assembly"
        technique="WebGL · Additive Points · Radial Repulsion"
        hint="move cursor to disperse · scroll to reform"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V01Particles;


