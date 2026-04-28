// V31Raymarch.jsx — Pure GLSL signed-distance-field raymarcher rendering an
// extruded "DS" silhouette as a piece of liquid black glass. No vertex
// geometry — the entire scene is computed per-pixel in the fragment shader.
// Cursor steers the camera; scroll changes the index of refraction.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(0, 0), progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uIor: { value: 1.45 },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: /* glsl */`
                precision highp float;
                varying vec2 vUv;
                uniform float uTime;
                uniform vec2 uResolution;
                uniform vec2 uMouse;
                uniform float uIor;

                // ---- SDF primitives ---------------------------------------
                float sdBox(vec3 p, vec3 b){ vec3 d = abs(p) - b; return length(max(d, 0.)) + min(max(d.x, max(d.y, d.z)), 0.); }
                float sdRoundBox(vec3 p, vec3 b, float r){ vec3 d = abs(p) - b; return length(max(d, 0.)) + min(max(d.x, max(d.y, d.z)), 0.) - r; }
                float sdCappedCyl(vec3 p, float h, float r){
                    vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h);
                    return min(max(d.x, d.y), 0.) + length(max(d, 0.));
                }
                float opS(float a, float b){ return max(-b, a); } // subtract
                float opU(float a, float b){ return min(a, b); }  // union
                float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0., 1.); return mix(b, a, h) - k*h*(1.-h); }

                // ---- "D" letter as a cylinder minus a cylinder + half ----
                float sdLetterD(vec3 p, float h, float r){
                    // Outer rounded body (a half-disc + bar)
                    float ring = abs(length(p.xy) - r) - 0.06;
                    float clipRight = -p.x;            // keep only x > 0 → half disc
                    float halfDisc = max(ring, clipRight);
                    float bar = sdRoundBox(p + vec3(0., 0., 0.) + vec3(r * 0.05, 0., 0.), vec3(0.06, r * 1.0, h), 0.02);
                    return min(halfDisc, bar);
                }

                // ---- "S" letter built from two stacked half-tori ---------
                float sdHalfTorus(vec3 p, vec2 t, float keep){
                    vec2 q = vec2(length(p.xy) - t.x, p.z);
                    float tor = length(q) - t.y;
                    return max(tor, keep * p.y);
                }
                float sdLetterS(vec3 p, float r, float thick){
                    p.z = clamp(p.z, -0.18, 0.18);
                    vec3 a = p - vec3(0., r * 0.55, 0.);
                    vec3 b = p - vec3(0., -r * 0.55, 0.);
                    float top = sdHalfTorus(a, vec2(r * 0.55, thick), -1.);
                    float bot = sdHalfTorus(b * vec3(-1., -1., 1.), vec2(r * 0.55, thick), -1.);
                    return min(top, bot);
                }

                // ---- Combined "DS" SDF -----------------------------------
                float map(vec3 p){
                    float d = sdLetterD(p + vec3(0.7, 0., 0.), 0.18, 0.62);
                    float s = sdLetterS(p + vec3(-0.7, 0., 0.), 0.62, 0.085);
                    return smin(d, s, 0.06);
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
                    for (int i = 0; i < 96; i++){
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
                    vec3 sky = mix(vec3(0.06, 0.10, 0.18), vec3(0.55, 0.20, 0.85), pow(h, 1.8));
                    sky += pow(max(0., dot(d, normalize(vec3(0.4, 0.6, 0.4)))), 60.) * vec3(1., 0.9, 0.8) * 0.6;
                    return sky;
                }

                void main(){
                    vec2 uv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.) * 2.;

                    // Camera orbit driven by mouse + time
                    float yaw = (uMouse.x - 0.5) * 1.4 + uTime * 0.05;
                    float pitch = (uMouse.y - 0.5) * 0.6;
                    vec3 ro = vec3(sin(yaw) * 3.2, sin(pitch) * 1.8, cos(yaw) * 3.2);
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
                        // Refraction
                        vec3 refr = refract(rd, n, 1.0 / uIor);
                        vec3 refl = reflect(rd, n);
                        vec3 colRefl = envColor(refl);
                        vec3 colRefr = envColor(refr) * vec3(0.85, 0.95, 1.05);
                        float fres = pow(1. - max(0., dot(-rd, n)), 3.5);
                        col = mix(colRefr, colRefl, fres);
                        // Edge glow
                        col += pow(fres, 1.6) * vec3(0.6, 0.95, 1.0) * 0.6;
                        // Inner ink
                        col *= 0.55 + 0.45 * smoothstep(0.6, 1.0, length(n.xy));
                    }
                    // vignette
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
        el.addEventListener('mousemove', onMove);

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
            el.removeEventListener('mousemove', onMove);
            mat.dispose();
            quad.geometry.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V31Raymarch = () => (
    <VariantShell index={31} title="Raymarch" technique="GLSL · SDF · Per-pixel Raymarcher · Refraction" hint="cursor orbits the camera · scroll bends light through the glass">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V31Raymarch;
