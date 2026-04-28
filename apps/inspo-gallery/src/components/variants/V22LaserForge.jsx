// V22LaserForge.jsx — Cinematic GLSL transition forging the 3 frames together
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
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let material;
        let disposed = false;
        const loader = new THREE.TextureLoader();
        Promise.all([
            loader.loadAsync(logoOutline),
            loader.loadAsync(logoBlack),
            loader.loadAsync(logoWhite)
        ]).then(([texO, texB, texW]) => {
            if (disposed) return; // section unmounted before textures loaded
            const aspect = el.clientWidth / el.clientHeight;
            const geo = new THREE.PlaneGeometry(2, 2);
            material = new THREE.ShaderMaterial({
                transparent: true,
                uniforms: {
                    uTime: { value: 0 },
                    uProgress: { value: 0 }, // 0..3 timeline
                    uTexO: { value: texO },
                    uTexB: { value: texB },
                    uTexW: { value: texW },
                    uAspect: { value: aspect }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main(){
                        vUv = uv;
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    uniform float uTime, uProgress, uAspect;
                    uniform sampler2D uTexO, uTexB, uTexW;

                    // Simplex noise
                    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                    float snoise(vec2 v){
                        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                        vec2 i  = floor(v + dot(v, C.yy) );
                        vec2 x0 = v -   i + dot(i, C.xx);
                        vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                        vec4 x12 = x0.xyxy + C.xxzz;
                        x12.xy -= i1;
                        i = mod289(i);
                        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                        m = m*m; m = m*m;
                        vec3 x = 2.0 * fract(p * C.www) - 1.0;
                        vec3 h = abs(x) - 0.5;
                        vec3 ox = floor(x + 0.5);
                        vec3 a0 = x - ox;
                        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                        vec3 g;
                        g.x  = a0.x  * x0.x  + h.x  * x0.y;
                        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                        return 130.0 * dot(m, g);
                    }

                    void main(){
                        // Maintain image aspect ratio in center
                        vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0) * 1.2 + 0.5;
                        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                            gl_FragColor = vec4(0.0);
                            return;
                        }

                        // Phases
                        float p1 = clamp(uProgress, 0.0, 1.0);       // Outline Burn
                        float p2 = clamp(uProgress - 1.0, 0.0, 1.0); // Black Glass Refract
                        float p3 = clamp(uProgress - 2.0, 0.0, 1.0); // White Metal Fill

                        // 1. Outline Burn
                        float n1 = snoise(uv * 10.0 - uTime * 0.5);
                        float burnEdge = smoothstep(p1 - 0.1, p1, n1 * 0.5 + 0.5);
                        vec4 colO = texture2D(uTexO, uv);
                        colO.rgb = vec3(1.0);
                        vec4 finalCol = colO * (1.0 - burnEdge);
                        // Add orange burn glow
                        if(burnEdge > 0.0 && burnEdge < 0.1) finalCol += vec4(1.0, 0.4, 0.0, 1.0) * colO.a;

                        // 2. Black DS Glass Refract
                        float n2 = snoise(uv * 20.0 + uTime);
                        vec2 distortUv = uv + vec2(n2) * 0.1 * (1.0 - p2);
                        vec4 colB = texture2D(uTexB, distortUv);
                        colB.rgb = vec3(1.0);
                        finalCol = mix(finalCol, colB, p2 * colB.a);

                        // 3. White 2 Metal Fill (Drops from top with liquid trail)
                        float drop = 1.0 - uv.y;
                        float fillMask = smoothstep(p3 - 0.2, p3, drop + snoise(uv*30.0)*0.1);
                        vec4 colW = texture2D(uTexW, uv);
                        colW.rgb = vec3(1.0);
                        finalCol = mix(finalCol, colW, (1.0 - fillMask) * colW.a);

                        // Add massive white flash when p3 hits 1.0
                        float flash = smoothstep(0.9, 1.0, uProgress) * smoothstep(3.0, 2.8, uProgress);
                        finalCol.rgb += vec3(1.0) * flash * colW.a;

                        gl_FragColor = finalCol;
                    }
                `
            });
            const mesh = new THREE.Mesh(geo, material);
            scene.add(mesh);
        });

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            if (material) {
                material.uniforms.uTime.value = t;
                state.current.time += clock.getDelta();
                const st = state.current.time;
                
                // Timeline: 0-1s Burn (0..1), 1.5-2.5s Glass (1..2), 3-4s Metal (2..3)
                let prog = 0;
                if(st > 0.5 && st <= 1.5) prog = (st - 0.5);
                if(st > 1.5 && st <= 2.0) prog = 1.0;
                if(st > 2.0 && st <= 3.0) prog = 1.0 + (st - 2.0);
                if(st > 3.0 && st <= 3.5) prog = 2.0;
                if(st > 3.5 && st <= 4.5) prog = 2.0 + (st - 3.5);
                if(st > 4.5) prog = 3.0;
                
                material.uniforms.uProgress.value = prog;
            }
            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        const onResize = () => {
            if(material) material.uniforms.uAspect.value = el.clientWidth / el.clientHeight;
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
            {/* Guaranteed-visibility logo overlay — sits over the laser-forge
                shader at low opacity so the DS reads even if the timeline is
                between phases or the textures haven't fully loaded. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <img src={logoWhite} alt="" aria-hidden className="w-[34vmin] opacity-25" style={{ filter: 'drop-shadow(0 0 14px rgba(0,0,0,0.5))' }} />
            </div>
        </>
    );
};

export const V22LaserForge = () => (
    <VariantShell
        index={22}
        title="Laser Forge"
        technique="WebGL · Fragment Shader · Noise Morphing"
        hint="snaps into place as you enter the section"
    >
        {({ active }) => <Scene active={active} />}
    </VariantShell>
);

export default V22LaserForge;
