// V30Volumetric.jsx — Gaussian-splat-style point cloud rendering of the DS2
// logo. Each "splat" is a Gaussian disc sprite with anisotropic falloff;
// thousands of them composite additively to form a volumetric, photogrammetry-
// inspired logo. Cursor parallaxes the cloud; scroll explodes it.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(0, 0), progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 14);

        // Backdrop
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.ShaderMaterial({
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
                fragmentShader: `varying vec2 vUv;
                    void main(){
                        vec2 p = vUv - 0.5;
                        float r = length(p);
                        vec3 col = mix(vec3(0.02, 0.03, 0.06), vec3(0.06, 0.02, 0.10), vUv.y);
                        col += smoothstep(0.6, 0.0, r) * vec3(0.05, 0.04, 0.10);
                        gl_FragColor = vec4(col, 1.);
                    }`,
            })
        );
        bg.position.z = -8;
        scene.add(bg);

        let points;
        sampleLogo(LOGO, { step: 1, threshold: 90, targetWidth: 600 }).then((sample) => {
            const COUNT = sample.count;
            const target = new Float32Array(COUNT * 3);
            const start = new Float32Array(COUNT * 3);
            const colors = new Float32Array(COUNT * 3);
            const sizes = new Float32Array(COUNT);
            const rotations = new Float32Array(COUNT);
            const ratios = new Float32Array(COUNT); // anisotropy

            const SCALE = 11;
            const c1 = new THREE.Color('hsl(195, 95%, 65%)');
            const c2 = new THREE.Color('hsl(285, 70%, 65%)');
            const c3 = new THREE.Color('#ffffff');

            for (let i = 0; i < COUNT; i++) {
                const x = sample.positions[i * 2] * SCALE;
                const y = sample.positions[i * 2 + 1] * SCALE;
                const z = (Math.random() - 0.5) * 0.6;
                target[i * 3] = x;
                target[i * 3 + 1] = y;
                target[i * 3 + 2] = z;
                // start position is offset slightly out from target
                start[i * 3] = x + (Math.random() - 0.5) * 1.6;
                start[i * 3 + 1] = y + (Math.random() - 0.5) * 1.6;
                start[i * 3 + 2] = z + (Math.random() - 0.5) * 4.0;

                const t = (x / SCALE + 0.5);
                const c = new THREE.Color().lerpColors(c1, c2, Math.max(0, Math.min(1, t)));
                if (Math.random() < 0.06) c.lerp(c3, 0.7);
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;

                sizes[i] = 0.18 + Math.random() * 0.18;
                rotations[i] = Math.random() * Math.PI * 2;
                ratios[i] = 0.35 + Math.random() * 0.65; // 1.0 = round, lower = elongated
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
            geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
            geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
            geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            geo.setAttribute('aRot', new THREE.BufferAttribute(rotations, 1));
            geo.setAttribute('aRatio', new THREE.BufferAttribute(ratios, 1));

            const mat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uExplode: { value: 0 },
                    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: `
                    attribute vec3 aTarget; attribute vec3 aStart; attribute vec3 aColor;
                    attribute float aSize; attribute float aRot; attribute float aRatio;
                    uniform float uTime; uniform float uExplode; uniform float uPixel;
                    varying vec3 vColor; varying float vRot; varying float vRatio;
                    void main(){
                        vec3 pos = mix(aTarget, aStart, uExplode);
                        // gentle breathing
                        pos += sin(uTime * 0.6 + aRot * 5.0) * 0.03;
                        vec4 mv = modelViewMatrix * vec4(pos, 1.);
                        gl_Position = projectionMatrix * mv;
                        gl_PointSize = aSize * 320. * uPixel / -mv.z;
                        vColor = aColor;
                        vRot = aRot;
                        vRatio = aRatio;
                    }`,
                fragmentShader: `
                    varying vec3 vColor; varying float vRot; varying float vRatio;
                    void main(){
                        vec2 uv = gl_PointCoord - 0.5;
                        float c = cos(vRot), s = sin(vRot);
                        uv = mat2(c, -s, s, c) * uv;
                        uv.y /= vRatio;            // anisotropic Gaussian
                        float d2 = dot(uv, uv);
                        float a = exp(-d2 * 18.0); // Gaussian falloff
                        gl_FragColor = vec4(vColor * 1.5, a * 0.85);
                        if (gl_FragColor.a < 0.01) discard;
                    }`,
            });
            points = new THREE.Points(geo, mat);
            scene.add(points);

            // expose for tick
            tickContext.points = points;
            tickContext.mat = mat;
        });

        const tickContext = { points: null, mat: null };

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        };
        el.addEventListener('mousemove', onMove);

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
            const t = clock.getElapsedTime();
            if (tickContext.mat) {
                tickContext.mat.uniforms.uTime.value = t;
                // explode: 0 (assembled) → 1 (scattered) follows scroll
                tickContext.mat.uniforms.uExplode.value = state.current.progress;
            }
            if (tickContext.points) {
                tickContext.points.rotation.y = state.current.mouse.x * 0.5 + Math.sin(t * 0.2) * 0.05;
                tickContext.points.rotation.x = state.current.mouse.y * 0.3;
            }
            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('mousemove', onMove);
            if (tickContext.points) {
                tickContext.points.geometry.dispose();
                tickContext.points.material.dispose();
            }
            bg.geometry.dispose(); bg.material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V30Volumetric = () => (
    <VariantShell index={30} title="Volumetric" technique="WebGL · Anisotropic Gaussian Splats · Additive Blend" hint="cursor parallaxes the cloud · scroll explodes the splats">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V30Volumetric;
