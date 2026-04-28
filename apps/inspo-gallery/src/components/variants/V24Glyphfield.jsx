// V24Glyphfield.jsx — Live ASCII rendering of a rotating 3D extruded DS2 logo.
// Two-pass: scene → offscreen render target → ASCII fragment shader samples
// the brightness and replaces each block with the closest matching glyph
// from a 16x16 font atlas. Cursor distorts the sample uvs.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const GLYPHS = ' .:-=+*#%@';
const ATLAS_COLS = 10;

function buildGlyphAtlas() {
    const tile = 32;
    const c = document.createElement('canvas');
    c.width = ATLAS_COLS * tile;
    c.height = tile;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${tile * 0.92}px ui-monospace, "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    for (let i = 0; i < GLYPHS.length; i++) {
        ctx.fillText(GLYPHS[i], i * tile + tile / 2, tile / 2 + 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
}

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

        // ---- Pass 1: render extruded logo to a render target ---------------
        const sceneA = new THREE.Scene();
        const camA = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);
        camA.position.set(0, 0, 8);

        const targetSize = new THREE.Vector2(el.clientWidth, el.clientHeight);
        let rt = new THREE.WebGLRenderTarget(targetSize.x, targetSize.y, {
            magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter,
        });

        const logoTex = new THREE.TextureLoader().load(LOGO, (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
        });
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 6 * 0.4),
            new THREE.MeshBasicMaterial({ map: logoTex, transparent: true })
        );
        sceneA.add(plane);

        // Subtle SF-blue radial accent — no magenta, restrained alpha
        const padGeo = new THREE.PlaneGeometry(20, 20);
        const padMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            transparent: true,
            depthWrite: false,
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
            fragmentShader: `varying vec2 vUv; uniform float uTime;
                void main(){
                    vec2 p = vUv - 0.5;
                    float r = length(p);
                    // Single SF-blue (#5AC8FA) accent that breathes very gently
                    vec3 col = vec3(0.35, 0.78, 0.98);
                    float a = smoothstep(0.65, 0.08, r) * (0.18 + sin(uTime*0.3)*0.04);
                    gl_FragColor = vec4(col, a);
                }`,
        });
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.z = -2;
        sceneA.add(pad);

        // ---- Pass 2: full-screen quad sampling the RT through ASCII shader -
        const sceneB = new THREE.Scene();
        const camB = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const atlas = buildGlyphAtlas();
        const asciiMat = new THREE.ShaderMaterial({
            uniforms: {
                uScene: { value: rt.texture },
                uAtlas: { value: atlas },
                uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
                uCellPx: { value: 12.0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uTime: { value: 0 },
                uNumGlyphs: { value: GLYPHS.length },
                uTint: { value: new THREE.Color(0.35, 0.78, 0.98) }, // SF Blue
            },
            vertexShader: `varying vec2 vUv;
                void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uScene;
                uniform sampler2D uAtlas;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                uniform float uCellPx;
                uniform float uTime;
                uniform float uNumGlyphs;
                uniform vec3 uTint;

                float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }

                void main(){
                    vec2 cellCount = floor(uResolution / uCellPx);
                    vec2 cellUV = floor(vUv * cellCount) / cellCount;
                    vec2 cellCenter = cellUV + 0.5 / cellCount;

                    // Cursor gravity warps the sample point
                    vec2 toMouse = cellCenter - uMouse;
                    float md = length(toMouse);
                    cellCenter += normalize(toMouse + 0.0001) * smoothstep(0.35, 0.0, md) * 0.04;

                    vec3 src = texture2D(uScene, cellCenter).rgb;
                    float L = lum(src);
                    float gIdx = floor(L * (uNumGlyphs - 1.0) + 0.5);

                    // Local UV inside the cell (0..1)
                    vec2 local = fract(vUv * cellCount);
                    // Atlas uv: glyph column = gIdx, row = 0
                    vec2 atlasUv = vec2((gIdx + local.x) / uNumGlyphs, local.y);
                    float glyphMask = texture2D(uAtlas, atlasUv).r;

                    // Restrained: SF-blue tint → cool white at high luminance
                    vec3 hi = vec3(0.95, 0.97, 1.0);
                    vec3 col = mix(uTint, hi, L);
                    col *= 0.5 + 0.55 * glyphMask;
                    // Very faint scanline shimmer (was 0.04 → 0.012)
                    col += 0.012 * sin(vUv.y * uResolution.y * 0.7 + uTime * 1.4);
                    gl_FragColor = vec4(col * (0.10 + glyphMask), 1.0);
                }`,
        });
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), asciiMat);
        sceneB.add(quad);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
            asciiMat.uniforms.uMouse.value.copy(state.current.mouse);
        };
        el.addEventListener('pointermove', onMove);

        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            renderer.setSize(w, h);
            camA.aspect = w / h;
            camA.updateProjectionMatrix();
            rt.setSize(w, h);
            asciiMat.uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            asciiMat.uniforms.uTime.value = t;
            padMat.uniforms.uTime.value = t;
            plane.rotation.y = Math.sin(t * 0.4) * 0.35 + state.current.progress * 0.6;
            plane.rotation.x = Math.cos(t * 0.3) * 0.18;
            renderer.setRenderTarget(rt);
            renderer.render(sceneA, camA);
            renderer.setRenderTarget(null);
            renderer.render(sceneB, camB);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            rt.dispose();
            atlas.dispose();
            logoTex.dispose();
            plane.geometry.dispose(); plane.material.dispose();
            pad.geometry.dispose(); pad.material.dispose();
            asciiMat.dispose();
            quad.geometry.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V24Glyphfield = () => (
    <VariantShell index={24} title="Glyphfield" technique="WebGL · Two-pass · ASCII Fragment Shader" hint="cursor warps the glyph grid · scroll rotates the logo">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V24Glyphfield;
