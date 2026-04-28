// V31Raymarch.jsx — Pure GLSL signed-distance-field raymarcher rendering a
// glass slab with the DS2 logo etched into its front face. Camera orbits
// with cursor; scroll bends the index of refraction.
//
// Why this isn't pure-SDF letterforms anymore: hand-derived SDFs for "DS"
// glyphs were unreliable (the user couldn't see the logo at all). Switched
// to a simple rounded-box SDF plus a logo texture sampled in the surface
// normal's local UV — gives a recognisable etched-glass tile.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import logoWhite from '@/assets/logo-white.png';

const IS_MOBILE = typeof window !== 'undefined' && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches);
const RAY_STEPS = IS_MOBILE ? 48 : 96;

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(0.5, 0.5), progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1 : 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();

        const logoTex = new THREE.TextureLoader().load(logoWhite);
        logoTex.colorSpace = THREE.SRGBColorSpace;
        logoTex.minFilter = THREE.LinearFilter;
        logoTex.magFilter = THREE.LinearFilter;

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uIor: { value: 1.45 },
                uLogo: { value: logoTex },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: /* glsl */`
                #define RAY_STEPS ${RAY_STEPS}
                precision highp float;
                varying vec2 vUv;
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                uniform float uIor;
                uniform sampler2D uLogo;

                // ---- SDF: a thin rounded box (the glass slab) ------------
                float sdRoundBox(vec3 p, vec3 b, float r){
                    vec3 d = abs(p) - b;
                    return length(max(d, 0.)) + min(max(d.x, max(d.y, d.z)), 0.) - r;
                }

                // The slab — wide, short, thin. Hosts the DS logo etched into
                // its front face via texture sampling in calcColor().
                float map(vec3 p){
                    return sdRoundBox(p, vec3(1.30, 0.55, 0.10), 0.06);
                }

                vec3 calcNormal(vec3 p){
                    float h = 0.001;
                    vec2 k = vec2(1., -1.);
                    return normalize(
                        k.xyy * map(p + k.xyy * h) +
                        k.yyx * map(p + k.yyx * h) +
                        k.yxy * map(p + k.yxy * h) +
                        k.xxx * map(p + k.xxx * h)
                    );
                }

                float raymarch(vec3 ro, vec3 rd){
                    float t = 0.;
                    for (int i = 0; i < RAY_STEPS; i++){
                        vec3 p = ro + rd * t;
                        float d = map(p);
                        if (d < 0.0008) return t;
                        if (t > 8.) break;
                        t += d * 0.85;
                    }
                    return -1.;
                }

                vec3 envColor(vec3 d){
                    float h = clamp(d.y * 0.5 + 0.5, 0., 1.);
                    // Restrained sky: deep neutral floor → soft cool ceiling
                    vec3 sky = mix(vec3(0.025, 0.030, 0.038), vec3(0.18, 0.30, 0.42), pow(h, 1.5));
                    sky += pow(max(0., dot(d, normalize(vec3(0.4, 0.6, 0.4)))), 80.) * vec3(1.0, 0.78, 0.55) * 0.35;
                    return sky;
                }

                // Sample the logo texture using the slab-local x/y as UV (only
                // returns logo where we hit the FRONT face — n.z dominantly +z)
                float sampleLogoAt(vec3 p, vec3 n){
                    vec2 uv = vec2(p.x / 2.6 + 0.5, 1.0 - (p.y / 1.1 + 0.5));
                    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
                    // Either-side etching (works for camera orbiting front + back)
                    float face = smoothstep(0.4, 0.9, abs(n.z));
                    vec4 t = texture2D(uLogo, uv);
                    // Use brightness as logo presence — works whether the PNG has
                    // alpha or not. Was using only .a; some PNGs are opaque-RGB.
                    float lum = max(t.a, (t.r + t.g + t.b) / 3.0);
                    return lum * face;
                }

                void main(){
                    vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.) * 2.;

                    // Camera orbit driven by mouse + slow time
                    float yaw = (uMouse.x - 0.5) * 1.0 + uTime * 0.05;
                    float pitch = (uMouse.y - 0.5) * 0.4;
                    vec3 ro = vec3(sin(yaw) * 3.6, sin(pitch) * 1.4, cos(yaw) * 3.6);
                    vec3 forward = normalize(-ro);
                    vec3 right = normalize(cross(vec3(0., 1., 0.), forward));
                    vec3 up = cross(forward, right);
                    vec3 rd = normalize(forward + uv.x * right + uv.y * up);

                    float t = raymarch(ro, rd);
                    vec3 col;
                    if (t < 0.) {
                        col = envColor(rd) * 0.4;
                    } else {
                        vec3 p = ro + rd * t;
                        vec3 n = calcNormal(p);
                        // Glass: refract + reflect with Fresnel mix
                        vec3 refr = refract(rd, n, 1.0 / uIor);
                        vec3 refl = reflect(rd, n);
                        vec3 colRefl = envColor(refl);
                        vec3 colRefr = envColor(refr) * vec3(0.92, 0.96, 1.02);
                        float fres = pow(1. - max(0., dot(-rd, n)), 3.5);
                        col = mix(colRefr, colRefl, fres);
                        // Etched logo: bright white where the texture says so
                        float logo = sampleLogoAt(p, n);
                        col = mix(col, vec3(1.0, 1.0, 1.0), logo * 0.95);
                        col += logo * vec3(0.20, 0.30, 0.40); // soft cool bloom on the etch
                        // Subtle SF-blue edge glow
                        col += pow(fres, 1.6) * vec3(0.35, 0.78, 0.98) * 0.30;
                    }
                    col *= 1.0 - 0.45 * length(uv) * 0.4;
                    gl_FragColor = vec4(pow(col, vec3(0.95)), 1.);
                }`,
        });

        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
        scene.add(quad);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
            mat.uniforms.uMouse.value.copy(state.current.mouse);
        };
        el.addEventListener('pointermove', onMove);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            mat.uniforms.uResolution.value.set(el.clientWidth, el.clientHeight);
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            mat.uniforms.uTime.value = t;
            mat.uniforms.uIor.value = 1.25 + state.current.progress * 0.6;
            renderer.render(scene, cam);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            mat.dispose();
            logoTex.dispose();
            quad.geometry.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V31Raymarch = () => (
    <VariantShell index={31} title="Raymarch" technique="GLSL · SDF · Etched Glass Slab · Refraction" hint="cursor orbits the glass · scroll bends the light through it">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V31Raymarch;
