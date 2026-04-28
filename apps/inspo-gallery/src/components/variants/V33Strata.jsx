// V33Strata.jsx — Multi-layer parallax of nine z-stacked DS2 logos at
// different depths and tints. Cursor parallaxes the entire stack; scroll
// pushes the layers apart, revealing the volumetric depth. Subtle scanline
// + grain overlay sells the "scope monitor" aesthetic.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const LAYERS = 9;

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
        const cam = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
        cam.position.set(0, 0, 9);

        // Backdrop with concentric scope rings
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
                fragmentShader: `varying vec2 vUv; uniform float uTime;
                    void main(){
                        vec2 p = (vUv - 0.5);
                        float r = length(p);
                        vec3 col = mix(vec3(0.02, 0.05, 0.10), vec3(0.04, 0.02, 0.10), vUv.y);
                        // scope rings
                        float ring = 0.5 + 0.5 * sin(r * 70.0 - uTime * 0.4);
                        col += smoothstep(0.85, 1.0, ring) * 0.04 * smoothstep(0.5, 0.0, r);
                        // crosshair
                        col += smoothstep(0.0015, 0.0, abs(p.x)) * 0.15;
                        col += smoothstep(0.0015, 0.0, abs(p.y)) * 0.15;
                        gl_FragColor = vec4(col, 1.);
                    }`,
            })
        );
        bg.position.z = -6;
        scene.add(bg);

        // Logo texture
        const logoTex = new THREE.TextureLoader().load(LOGO);
        logoTex.colorSpace = THREE.SRGBColorSpace;

        // Nine layered planes
        const layers = [];
        const baseW = 6, baseH = 6 * 0.4;
        for (let i = 0; i < LAYERS; i++) {
            const t = i / (LAYERS - 1);
            const hue = 200 + t * 80;
            const tint = new THREE.Color(`hsl(${hue}, 90%, ${55 + t * 10}%)`);
            const mat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uMap: { value: logoTex },
                    uTint: { value: tint },
                    uOpacity: { value: 0.35 + (1 - t) * 0.4 },
                    uOffset: { value: new THREE.Vector2(0, 0) },
                },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
                fragmentShader: `varying vec2 vUv;
                    uniform sampler2D uMap; uniform vec3 uTint; uniform float uOpacity; uniform vec2 uOffset;
                    void main(){
                        vec2 uv = vUv + uOffset;
                        vec4 t = texture2D(uMap, uv);
                        if (t.a < 0.05) discard;
                        gl_FragColor = vec4(uTint * 1.6, t.a * uOpacity);
                    }`,
            });
            const m = new THREE.Mesh(new THREE.PlaneGeometry(baseW, baseH), mat);
            m.position.z = -i * 0.6;
            scene.add(m);
            layers.push({ mesh: m, mat, depthIndex: t });
        }

        // Foreground film grain + scanline overlay
        const grainMat = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
            fragmentShader: `varying vec2 vUv; uniform float uTime; uniform vec2 uResolution;
                float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
                void main(){
                    float n = hash(vUv * uResolution + uTime * 100.0);
                    float scan = 0.5 + 0.5 * sin(vUv.y * uResolution.y * 0.6);
                    float a = (n - 0.5) * 0.06 + scan * 0.04;
                    gl_FragColor = vec4(vec3(a), 1.) * 0.5;
                }`,
        });
        const grain = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), grainMat);
        grain.position.z = 4;
        scene.add(grain);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
        };
        el.addEventListener('pointermove', onMove);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            cam.aspect = el.clientWidth / el.clientHeight;
            cam.updateProjectionMatrix();
            grainMat.uniforms.uResolution.value.set(el.clientWidth, el.clientHeight);
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            bg.material.uniforms.uTime.value = t;
            grainMat.uniforms.uTime.value = t;

            // Per-layer parallax: deeper layers move less
            const mx = state.current.mouse.x, my = state.current.mouse.y;
            const sep = 0.6 + state.current.progress * 1.4;  // scroll spreads the layers
            layers.forEach(({ mesh, mat, depthIndex }, i) => {
                const parallax = 1.0 - depthIndex; // foreground layers move most
                mesh.position.x = -mx * parallax * 0.8;
                mesh.position.y = -my * parallax * 0.5;
                mesh.position.z = -i * sep;
                mat.uniforms.uOffset.value.set(
                    mx * 0.005 * (1 - depthIndex),
                    my * 0.005 * (1 - depthIndex),
                );
                // gentle pulse
                const breath = 1.0 + 0.025 * Math.sin(t * 0.6 + i * 0.4);
                mesh.scale.setScalar(breath);
            });

            renderer.render(scene, cam);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            logoTex.dispose();
            layers.forEach(({ mesh, mat }) => { mesh.geometry.dispose(); mat.dispose(); });
            bg.geometry.dispose(); bg.material.dispose();
            grain.geometry.dispose(); grainMat.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V33Strata = () => (
    <VariantShell index={33} title="Strata" technique="WebGL · Z-Stacked Parallax · Scope Overlay" hint="cursor parallaxes the stack · scroll separates the layers">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V33Strata;
