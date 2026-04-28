// V25Isosurface.jsx — Marching cubes metaballs that morph between a free-form
// drift state and the DS2 logo silhouette. Liquid mercury aesthetic.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo } from '@/lib/logoSampler';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';
const IS_MOBILE = typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches);

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector3(-9, 0, 0), progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 7);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        // Liquid chrome PBR — neutral silver, no chromatic tint
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0xf2f4f7,
            metalness: 0.95,
            roughness: 0.22,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.2,
            emissive: 0x000000,
        });

        const resolution = IS_MOBILE ? 32 : 56;
        const cubes = new MarchingCubes(resolution, mat, true, true, IS_MOBILE ? 30000 : 80000);
        cubes.position.set(0, 0, 0);
        cubes.scale.set(2.6, 2.6, 2.6);
        cubes.isolation = 80;
        scene.add(cubes);

        // Lights — cool key + warm rim, both restrained
        scene.add(new THREE.AmbientLight(0x1c2026, 0.55));
        const key = new THREE.DirectionalLight(0xc8e6ff, 1.1);
        key.position.set(4, 4, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffd9b8, 0.6); // warm peach rim
        rim.position.set(-5, -2, -3);
        scene.add(rim);

        // Backdrop — pure deep neutral, no purple wash
        const bgGeo = new THREE.PlaneGeometry(40, 40);
        const bgMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            depthWrite: false,
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
            fragmentShader: `varying vec2 vUv; uniform float uTime;
                void main(){
                    // Deep near-black with the faintest cool tilt
                    vec3 a = vec3(0.018, 0.022, 0.030);
                    vec3 b = vec3(0.030, 0.038, 0.052);
                    vec3 col = mix(a, b, smoothstep(0., 1., vUv.y));
                    col += 0.006 * sin(uTime * 0.4 + vUv.x * 4.0);
                    gl_FragColor = vec4(col, 1.0);
                }`,
        });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        bg.position.z = -8;
        scene.add(bg);

        // Logo sample = target metaball positions for "morph" pose
        let logoTargets = [];
        sampleLogo(LOGO, { step: 6, threshold: 130, targetWidth: 200 }).then((s) => {
            const max = Math.min(s.count, 28);
            for (let i = 0; i < max; i++) {
                logoTargets.push(new THREE.Vector3(s.positions[i * 2] * 0.8, s.positions[i * 2 + 1] * 0.4, 0));
            }
        });

        const drift = [];
        const N = 18;
        for (let i = 0; i < N; i++) {
            drift.push({
                phase: Math.random() * Math.PI * 2,
                speedX: 0.4 + Math.random() * 0.6,
                speedY: 0.4 + Math.random() * 0.6,
                speedZ: 0.3 + Math.random() * 0.4,
            });
        }

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            state.current.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        };
        el.addEventListener('pointermove', onMove);

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
            bgMat.uniforms.uTime.value = t;

            cubes.reset();
            const morph = THREE.MathUtils.smoothstep(state.current.progress, 0, 1);

            for (let i = 0; i < N; i++) {
                const d = drift[i];
                const fx = 0.5 + 0.42 * Math.sin(d.phase + t * d.speedX);
                const fy = 0.5 + 0.42 * Math.cos(d.phase + t * d.speedY);
                const fz = 0.5 + 0.30 * Math.sin(d.phase + t * d.speedZ);

                let x = fx, y = fy, z = fz;
                if (logoTargets.length && i < logoTargets.length) {
                    const tg = logoTargets[i];
                    x = THREE.MathUtils.lerp(fx, 0.5 + tg.x * 0.5, morph);
                    y = THREE.MathUtils.lerp(fy, 0.5 + tg.y * 0.5, morph);
                    z = THREE.MathUtils.lerp(fz, 0.5, morph);
                }
                cubes.addBall(x, y, z, 0.42, 12);
            }
            // cursor metaball
            cubes.addBall(0.5 + state.current.mouse.x * 0.45, 0.5 + state.current.mouse.y * 0.45, 0.5, 0.3, 8);
            cubes.update();

            cubes.rotation.y = t * 0.12 + state.current.mouse.x * 0.4;
            cubes.rotation.x = state.current.mouse.y * 0.25;

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            mat.dispose();
            bg.geometry.dispose(); bg.material.dispose();
            cubes.material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V25Isosurface = () => (
    <VariantShell index={25} title="Isosurface" technique="WebGL · Marching Cubes · Mercury PBR" hint="cursor pulls a metaball · scroll morphs blobs into the logo">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V25Isosurface;
