// V16LiquidGlass.jsx — DS2 logo seen through a liquid-glass surface.
// Custom WebGL fragment shader: animated water normals refract the logo with
// chromatic dispersion + caustic highlights; cursor drops fresh ripples.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({
        mouse: new THREE.Vector2(0.5, 0.5),
        ripples: [], // {x, y, t}
        active: false,
        progress: 0,
    });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);

        const logoTex = new THREE.TextureLoader().load(LOGO, (t) => {
            t.minFilter = THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
            t.colorSpace = THREE.SRGBColorSpace;
        });

        const MAX_RIPPLES = 8;
        const ripplesUniform = new Float32Array(MAX_RIPPLES * 3); // x, y, t

        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uLogo: { value: logoTex },
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uRes: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
                uRipples: { value: ripplesUniform },
                uRippleCount: { value: 0 },
                uProg: { value: 0 },
            },
            vertexShader: `
                varying vec2 vUv;
                void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`,
            fragmentShader: `
                precision highp float;
                uniform sampler2D uLogo;
                uniform float uTime;
                uniform vec2 uMouse;
                uniform vec2 uRes;
                uniform vec3 uRipples[${MAX_RIPPLES}];
                uniform int uRippleCount;
                uniform float uProg;
                varying vec2 vUv;

                // Hash-based 2D value noise
                float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
                float vnoise(vec2 p){
                    vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
                    return mix(mix(hash(i), hash(i+vec2(1,0)),f.x),
                               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)),f.x), f.y);
                }
                // 4-octave fbm
                float fbm(vec2 p){
                    float v=0.0, a=0.5;
                    for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.05; a*=0.5; }
                    return v;
                }

                // Compute water height field at (uv) with cursor + ripples
                float water(vec2 uv){
                    float t = uTime * 0.45;
                    float h = fbm(uv * 4.5 + vec2(t * 0.6, t * 0.9)) * 0.55;
                    h += fbm(uv * 9.0 - vec2(t, t * 0.3)) * 0.25;
                    // mouse persistent dome
                    float md = length(uv - uMouse);
                    h += sin(md * 18.0 - uTime * 5.0) * exp(-md * 4.0) * 0.35 * (0.6 + uProg);
                    // click ripples
                    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
                        if (i >= uRippleCount) break;
                        vec3 r = uRipples[i];
                        float d = length(uv - r.xy);
                        float age = r.z;
                        h += sin(d * 30.0 - age * 0.18) * exp(-d * 5.0 - age * 0.012) * 0.45;
                    }
                    return h;
                }

                void main(){
                    vec2 uv = vUv;
                    // Compute normal via finite differences
                    vec2 e = vec2(1.0 / uRes.x, 1.0 / uRes.y) * 2.5;
                    float hL = water(uv - vec2(e.x, 0.0));
                    float hR = water(uv + vec2(e.x, 0.0));
                    float hD = water(uv - vec2(0.0, e.y));
                    float hU = water(uv + vec2(0.0, e.y));
                    vec2 normal = vec2(hL - hR, hD - hU);
                    // Chromatic refraction — sample logo with channel-specific offsets
                    float refractStrength = 0.025 + uProg * 0.02;
                    vec2 sampleUv = vec2(uv.x, 1.0 - uv.y);
                    vec2 nOff = normal * refractStrength;
                    float r = texture2D(uLogo, sampleUv + nOff * 1.3).a;
                    float g = texture2D(uLogo, sampleUv + nOff * 1.0).a;
                    float b = texture2D(uLogo, sampleUv + nOff * 0.7).a;
                    // Color mapping for the logo: ember/frost gradient
                    vec3 baseColor = mix(vec3(1.0, 0.5, 0.12), vec3(0.18, 0.95, 0.95), smoothstep(0.25, 0.85, uv.x));
                    baseColor = mix(baseColor, vec3(1.0, 0.95, 0.85), 0.3);
                    vec3 logoCol = vec3(r, g, b) * baseColor * 1.4;
                    // Caustics — bright bands where the water focuses light
                    float caustic = smoothstep(0.55, 1.0, water(uv * 1.2));
                    caustic *= caustic;
                    vec3 causticCol = vec3(0.9, 0.7, 0.4) * caustic * 0.55;
                    // Subtle cyan rim around logo
                    float rim = smoothstep(0.4, 0.0, abs(g - 0.5)) * g;
                    // Compose
                    vec3 col = logoCol + causticCol;
                    col += vec3(0.05, 0.18, 0.25) * rim * 0.6;
                    // Vignette
                    float vig = smoothstep(1.1, 0.4, length(uv - 0.5));
                    col *= mix(0.4, 1.0, vig);
                    float alpha = max(max(col.r, col.g), col.b) * 0.9 + caustic * 0.35;
                    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
                }`,
            transparent: true,
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        scene.add(mesh);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set(
                (e.clientX - r.left) / r.width,
                1.0 - (e.clientY - r.top) / r.height
            );
        };
        const onClick = (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = 1.0 - (e.clientY - r.top) / r.height;
            state.current.ripples.push({ x, y, t: 0 });
            if (state.current.ripples.length > MAX_RIPPLES) state.current.ripples.shift();
        };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('click', onClick);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            mat.uniforms.uTime.value = t;
            mat.uniforms.uMouse.value.copy(state.current.mouse);
            mat.uniforms.uProg.value = state.current.progress;
            // Update ripple ages
            for (let i = 0; i < state.current.ripples.length; i++) {
                state.current.ripples[i].t += 1;
                ripplesUniform[i * 3] = state.current.ripples[i].x;
                ripplesUniform[i * 3 + 1] = state.current.ripples[i].y;
                ripplesUniform[i * 3 + 2] = state.current.ripples[i].t;
            }
            mat.uniforms.uRippleCount.value = state.current.ripples.length;
            // Drop very old ripples
            state.current.ripples = state.current.ripples.filter((r) => r.t < 600);
            renderer.render(scene, cam);
        };
        raf = requestAnimationFrame(tick);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            mat.uniforms.uRes.value.set(el.clientWidth, el.clientHeight);
        };
        window.addEventListener('resize', onResize);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('click', onClick);
            mat.dispose();
            mesh.geometry.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.active = active;
    state.current.progress = progress;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V16LiquidGlass = () => (
    <VariantShell
        index={16}
        title="Liquid Glass Refraction"
        technique="WebGL · Animated water normals · Chromatic dispersion · Caustics"
        hint="hover to push the surface · click to drop a ripple"
        accent="secondary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V16LiquidGlass;
