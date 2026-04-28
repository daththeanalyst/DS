// V23DepthStack.jsx — Layers align perfectly on the Z-axis creating a massive bloom flash
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

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
        // Camera starts far back to see layers in depth
        const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 15);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let meshO, meshB, meshW;
        let disposed = false;

        const loader = new THREE.TextureLoader();
        Promise.all([
            loader.loadAsync(logoOutline),
            loader.loadAsync(logoBlack),
            loader.loadAsync(logoWhite)
        ]).then(([texO, texB, texW]) => {
            if (disposed) return;
            const aspect = texO.image.width / texO.image.height;
            const geo = new THREE.PlaneGeometry(8 * aspect, 8);
            
            const matBase = { transparent: true, side: THREE.DoubleSide };
            meshO = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ ...matBase, map: texO }));
            meshB = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ ...matBase, map: texB }));
            meshW = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ ...matBase, map: texW }));
            
            scene.add(meshO, meshB, meshW);
        });

        // Add a massive glowing plane in the back that flashes
        const flashGeo = new THREE.PlaneGeometry(50, 50);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
        const flashMesh = new THREE.Mesh(flashGeo, flashMat);
        flashMesh.position.z = -5;
        scene.add(flashMesh);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            state.current.time += clock.getDelta();
            const st = state.current.time;

            if (meshO && meshB && meshW) {
                // Easing functions
                const easeOutBack = x => {
                    const c1 = 1.70158; const c3 = c1 + 1;
                    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
                };
                const easeOutExp = x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

                // Timeline logic
                // 0.5s -> 1.5s: Outline zooms from deep space (z=-50) to z=0
                let pO = clamp((st - 0.5) / 1.0);
                meshO.position.z = mix(-40, 0, easeOutExp(pO));
                meshO.material.opacity = smoothstep(0, 0.2, pO);

                // 2.0s -> 3.0s: Black DS flies in from the right and rotates 90deg
                let pB = clamp((st - 2.0) / 1.0);
                meshB.position.x = mix(20, 0, easeOutBack(pB));
                meshB.position.z = mix(5, 0, easeOutExp(pB));
                meshB.rotation.y = mix(Math.PI / 2, 0, easeOutBack(pB));
                meshB.material.opacity = smoothstep(0, 0.2, pB);

                // 3.5s -> 4.5s: White 2 drops from above
                let pW = clamp((st - 3.5) / 1.0);
                meshW.position.y = mix(15, 0, easeOutBack(pW));
                meshW.position.z = mix(10, 0, easeOutExp(pW));
                meshW.rotation.x = mix(-Math.PI / 4, 0, easeOutBack(pW));
                meshW.material.opacity = smoothstep(0, 0.2, pW);

                // 4.5s -> 5.0s: The alignment flash!
                let flashP = clamp((st - 4.5) / 0.5);
                flashMat.opacity = smoothstep(0, 0.5, flashP) * smoothstep(1, 0.5, flashP); // peaks at 0.5
                
                // Add cinematic camera shake when parts slam together
                let shake = 0;
                if(st > 2.0 && st < 2.2) shake = (2.2 - st) * 0.5;
                if(st > 3.5 && st < 3.7) shake = (3.7 - st) * 0.5;
                if(st > 4.5 && st < 4.8) shake = (4.8 - st) * 1.0;
                
                camera.position.x = (Math.random() - 0.5) * shake;
                camera.position.y = (Math.random() - 0.5) * shake;

                // Subtle drifting of camera
                camera.position.x += Math.sin(t * 0.5) * 0.01;
                camera.position.y += Math.cos(t * 0.6) * 0.01;
                camera.lookAt(0, 0, 0);
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

    useEffect(() => {
        state.current.active = active;
        if (active) state.current.time = 0;
    }, [active]);

    return (
        <>
            <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <img src={logoWhite} alt="" aria-hidden className="w-[34vmin] opacity-25" style={{ filter: 'drop-shadow(0 0 14px rgba(0,0,0,0.5))' }} />
            </div>
        </>
    );
};

// Utils
function clamp(x) { return Math.max(0, Math.min(1, x)); }
function mix(a, b, t) { return a * (1 - t) + b * t; }
function smoothstep(e0, e1, x) {
    let t = clamp((x - e0) / (e1 - e0));
    return t * t * (3 - 2 * t);
}

export const V23DepthStack = () => (
    <VariantShell
        index={23}
        title="Depth Stack Alignment"
        technique="WebGL · Z-Axis Translation · Cinematic Collision"
        hint="snaps into place as you enter the section"
    >
        {({ active }) => <Scene active={active} />}
    </VariantShell>
);

export default V23DepthStack;
