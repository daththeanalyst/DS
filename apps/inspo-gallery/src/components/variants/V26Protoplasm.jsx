// V26Protoplasm.jsx — Gray-Scott reaction-diffusion painted with the DS2 logo
// as the seed pattern. Two render targets ping-pong each other to evolve the
// chemistry. Cursor injects fresh "feed". Looks like crystallizing tech ink.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(-9, -9), down: 0, progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(1);
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        // Simulation runs at half-resolution for perf
        const SIM_W = Math.max(256, Math.floor(el.clientWidth / 2));
        const SIM_H = Math.max(160, Math.floor(el.clientHeight / 2));

        const rtOpts = {
            type: THREE.HalfFloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            depthBuffer: false,
            stencilBuffer: false,
        };
        let rtA = new THREE.WebGLRenderTarget(SIM_W, SIM_H, rtOpts);
        let rtB = new THREE.WebGLRenderTarget(SIM_W, SIM_H, rtOpts);

        const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // ---- Step shader (Gray-Scott) -------------------------------------
        const stepScene = new THREE.Scene();
        const stepMat = new THREE.ShaderMaterial({
            uniforms: {
                uPrev: { value: rtA.texture },
                uTexel: { value: new THREE.Vector2(1 / SIM_W, 1 / SIM_H) },
                uMouse: { value: new THREE.Vector2(-9, -9) },
                uDown: { value: 0 },
                uFeed: { value: 0.0367 },
                uKill: { value: 0.0649 },
                uDt: { value: 1.0 },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uPrev;
                uniform vec2 uTexel;
                uniform vec2 uMouse;
                uniform float uDown, uFeed, uKill, uDt;

                void main(){
                    vec2 uv = vUv;
                    vec4 c = texture2D(uPrev, uv);
                    float A = c.r, B = c.g;
                    // 9-point laplacian
                    vec2 t = uTexel;
                    vec4 n = texture2D(uPrev, uv + vec2( 0.,  t.y));
                    vec4 s = texture2D(uPrev, uv + vec2( 0., -t.y));
                    vec4 w = texture2D(uPrev, uv + vec2(-t.x, 0.));
                    vec4 e = texture2D(uPrev, uv + vec2( t.x, 0.));
                    vec4 nw = texture2D(uPrev, uv + vec2(-t.x,  t.y));
                    vec4 ne = texture2D(uPrev, uv + vec2( t.x,  t.y));
                    vec4 sw = texture2D(uPrev, uv + vec2(-t.x, -t.y));
                    vec4 se = texture2D(uPrev, uv + vec2( t.x, -t.y));

                    vec2 lap = (
                        0.2 * (n.rg + s.rg + w.rg + e.rg) +
                        0.05 * (nw.rg + ne.rg + sw.rg + se.rg) -
                        c.rg
                    );

                    float dA = 1.0 * lap.r - A * B * B + uFeed * (1.0 - A);
                    float dB = 0.5 * lap.g + A * B * B - (uKill + uFeed) * B;

                    A += dA * uDt;
                    B += dB * uDt;

                    // mouse seeding
                    float md = distance(uv, uMouse) * vec2(uTexel.y / uTexel.x, 1.).x;
                    float seed = smoothstep(0.04, 0.0, md) * uDown;
                    B = clamp(B + seed * 0.6, 0., 1.);

                    gl_FragColor = vec4(clamp(A, 0., 1.), clamp(B, 0., 1.), 0., 1.);
                }`,
        });
        const stepQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), stepMat);
        stepScene.add(stepQuad);

        // ---- Display shader (colourise + bloom-ish glow) -------------------
        const showScene = new THREE.Scene();
        const showMat = new THREE.ShaderMaterial({
            uniforms: {
                uTex: { value: rtA.texture },
                uTime: { value: 0 },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uTex;
                uniform float uTime;
                void main(){
                    vec2 uv = vUv;
                    float B = texture2D(uTex, uv).g;
                    float B2 = texture2D(uTex, uv + vec2(0.002, 0.0)).g;
                    float B3 = texture2D(uTex, uv - vec2(0.002, 0.0)).g;
                    float edge = abs(B2 - B3) * 6.0;
                    vec3 ink = mix(vec3(0.0, 0.55, 0.95), vec3(0.55, 0.05, 0.85), B);
                    vec3 col = ink * smoothstep(0.18, 0.55, B);
                    col += edge * vec3(0.85, 1.0, 1.0) * 0.7;
                    col += 0.04 * sin(vUv.y * 1200.0 + uTime * 1.5);
                    gl_FragColor = vec4(col, 1.);
                }`,
        });
        const showQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), showMat);
        showScene.add(showQuad);

        // ---- Seed: paint the logo into the B channel of rtA ---------------
        const loader = new THREE.TextureLoader();
        loader.load(LOGO, (logoTex) => {
            const seedScene = new THREE.Scene();
            const seedMat = new THREE.ShaderMaterial({
                uniforms: { uLogo: { value: logoTex } },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
                fragmentShader: `varying vec2 vUv; uniform sampler2D uLogo;
                    void main(){
                        vec2 uv = vUv;
                        // Aspect-fit logo (assume 16:9 sim, logo wider than tall)
                        vec2 luv = (uv - 0.5) * vec2(1.6, 1.0) + 0.5;
                        if (luv.x < 0. || luv.x > 1. || luv.y < 0. || luv.y > 1.) {
                            gl_FragColor = vec4(1., 0., 0., 1.);
                            return;
                        }
                        vec4 l = texture2D(uLogo, luv);
                        float v = l.a > 0.1 ? l.r : 0.0;
                        // start with A=1 everywhere, B = logo
                        gl_FragColor = vec4(1.0, v * 0.55, 0., 1.);
                    }`,
            });
            const seedQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), seedMat);
            seedScene.add(seedQuad);
            renderer.setRenderTarget(rtA);
            renderer.render(seedScene, orthoCam);
            renderer.setRenderTarget(null);
            seedMat.dispose();
        });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
        };
        const onDown = () => { state.current.down = 1; };
        const onUp = () => { state.current.down = 0; };
        const onLeave = () => { state.current.down = 0; state.current.mouse.set(-9, -9); };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        el.addEventListener('mouseleave', onLeave);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            stepMat.uniforms.uMouse.value.copy(state.current.mouse);
            stepMat.uniforms.uDown.value = 0.6 + state.current.down;
            // 6 sub-steps per visible frame
            for (let i = 0; i < 6; i++) {
                stepMat.uniforms.uPrev.value = rtA.texture;
                renderer.setRenderTarget(rtB);
                renderer.render(stepScene, orthoCam);
                const tmp = rtA; rtA = rtB; rtB = tmp;
            }
            renderer.setRenderTarget(null);
            showMat.uniforms.uTex.value = rtA.texture;
            showMat.uniforms.uTime.value = t;
            renderer.render(showScene, orthoCam);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mouseup', onUp);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mousedown', onDown);
            el.removeEventListener('mouseleave', onLeave);
            rtA.dispose(); rtB.dispose();
            stepMat.dispose(); showMat.dispose();
            stepQuad.geometry.dispose(); showQuad.geometry.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V26Protoplasm = () => (
    <VariantShell index={26} title="Protoplasm" technique="WebGL · Reaction-Diffusion · Ping-pong FBO" hint="hold mouse to seed · ink crystallizes from the logo">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V26Protoplasm;
