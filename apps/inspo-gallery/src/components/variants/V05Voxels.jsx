// V05Voxels.jsx — instanced cubes height-extruded from the logo brightness map
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo, sampleBrightness } from '@/lib/logoSampler';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector3(-999, -999, 0), mouseAct: 0, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(48, el.clientWidth / el.clientHeight, 0.1, 200);
        camera.position.set(0, -8, 16);
        camera.lookAt(0, 0, 0);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffaa66, 1.4);
        key.position.set(8, 14, 10);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x66ddff, 0.7);
        rim.position.set(-8, 6, -6);
        scene.add(rim);

        let mesh, disposed = false;
        const COLS = 110;
        const ROWS = 46;
        const SCALE_X = 18;
        let SCALE_Y = 18 * (ROWS / COLS) * 1.2;
        const dummy = new THREE.Object3D();

        sampleLogo(LOGO, { step: 1, threshold: 150, targetWidth: 800 }).then((sample) => {
            if (disposed) return;
            SCALE_Y = SCALE_X / sample.aspect * (ROWS / COLS) * 2.2;
            const N = COLS * ROWS;
            const geo = new THREE.BoxGeometry(0.13, 0.13, 1);
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color('#fff5e8'),
                metalness: 0.3,
                roughness: 0.45,
                vertexColors: false,
            });
            mesh = new THREE.InstancedMesh(geo, mat, N);
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

            const primary = new THREE.Color('hsl(22, 95%, 60%)');
            const frost = new THREE.Color('hsl(175, 85%, 55%)');
            const dim = new THREE.Color('hsl(225, 12%, 22%)');

            for (let j = 0; j < ROWS; j++) {
                for (let i = 0; i < COLS; i++) {
                    const idx = j * COLS + i;
                    const u = i / (COLS - 1);
                    const v = j / (ROWS - 1);
                    const br = sampleBrightness(sample, u, v) / 255;
                    const x = (u - 0.5) * SCALE_X;
                    const y = (0.5 - v) * SCALE_Y;
                    const h = 0.18 + br * 3.0;
                    dummy.position.set(x, y, h / 2);
                    dummy.scale.set(1, 1, h);
                    dummy.updateMatrix();
                    mesh.setMatrixAt(idx, dummy.matrix);
                    const c = br > 0.4 ? primary.clone().lerp(frost, u) : dim;
                    mesh.setColorAt(idx, c);
                }
            }
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
            mesh.userData.sample = sample;
            scene.add(mesh);
        });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 2 - 1;
            const y = -((e.clientY - r.top) / r.height) * 2 + 1;
            // Project to z=0 plane
            const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = v.sub(camera.position).normalize();
            // Intersect with z=0 plane
            const t = -camera.position.z / dir.z;
            state.current.mouse.copy(camera.position).add(dir.multiplyScalar(t));
            state.current.mouseAct = 1;
        };
        const onLeave = () => { state.current.mouseAct = 0; };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);

        let raf, t0 = performance.now();
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = (performance.now() - t0) * 0.001;
            if (mesh) {
                const sample = mesh.userData.sample;
                const prog = state.current.progress;
                const waveAmp = 0.4 + prog * 1.8;
                const mx = state.current.mouse.x;
                const my = state.current.mouse.y;
                const ma = state.current.mouseAct;
                for (let j = 0; j < ROWS; j++) {
                    for (let i = 0; i < COLS; i++) {
                        const idx = j * COLS + i;
                        const u = i / (COLS - 1);
                        const v = j / (ROWS - 1);
                        const br = sampleBrightness(sample, u, v) / 255;
                        const x = (u - 0.5) * SCALE_X;
                        const y = (0.5 - v) * SCALE_Y;
                        const base = 0.18 + br * 3.0;
                        const wave = Math.sin(x * 0.5 + t * 1.6 + j * 0.18) * 0.18 * waveAmp;
                        const cd = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                        const lift = Math.exp(-cd / 2.4) * 3.5 * ma;
                        const h = Math.max(0.12, base + wave + lift);
                        dummy.position.set(x, y, h / 2);
                        dummy.scale.set(1, 1, h);
                        dummy.rotation.set(0, 0, 0);
                        dummy.updateMatrix();
                        mesh.setMatrixAt(idx, dummy.matrix);
                    }
                }
                mesh.instanceMatrix.needsUpdate = true;
                mesh.rotation.z = Math.sin(t * 0.2) * 0.015;
            }
            // gentle camera orbit around origin
            const rad = 16;
            const orbit = Math.sin(t * 0.18) * 0.18;
            camera.position.x = Math.sin(orbit) * rad * 0.2;
            camera.position.y = -8 + state.current.progress * 4;
            camera.position.z = rad - state.current.progress * 4;
            camera.lookAt(0, 0, 0);
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

export const V05Voxels = () => (
    <VariantShell
        index={5}
        title="Voxel Height Field"
        technique="WebGL · InstancedMesh · Brightness-mapped extrusion"
        hint="hover to lift columns · scroll to raise the whole field"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V05Voxels;

