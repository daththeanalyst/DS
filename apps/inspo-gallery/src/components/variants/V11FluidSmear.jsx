// V11FluidSmear.jsx — WebGL ping-pong feedback. The DS2 logo is "ink" injected into
// a feedback buffer that advects based on the cursor's motion. Like watercolor in water.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

import logoImg from '@/assets/logo-outline.png';
const LOGO = logoImg;

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({
        mouse: new THREE.Vector2(0.5, 0.5),
        prevMouse: new THREE.Vector2(0.5, 0.5),
        delta: new THREE.Vector2(0, 0),
        active: false,
        progress: 0,
    });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(1);
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        // Two render targets for ping-pong
        const targetSize = () => ({
            w: Math.floor(el.clientWidth * 0.6),
            h: Math.floor(el.clientHeight * 0.6),
        });
        let { w, h } = targetSize();
        const rtA = new THREE.WebGLRenderTarget(w, h, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
        });
        const rtB = rtA.clone();
        let read = rtA, write = rtB;

        const fsScene = new THREE.Scene();
        const fsCam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
        const fsGeo = new THREE.PlaneGeometry(1, 1);

        const logoTex = new THREE.TextureLoader().load(LOGO, (t) => {
            t.minFilter = THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
            t.colorSpace = THREE.SRGBColorSpace;
        });

        // Advection material
        const advMat = new THREE.ShaderMaterial({
            uniforms: {
                uPrev: { value: null },
                uLogo: { value: logoTex },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uDelta: { value: new THREE.Vector2(0, 0) },
                uTime: { value: 0 },
                uProg: { value: 0 },
            },
            vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`,
            fragmentShader: `
        precision highp float;
        uniform sampler2D uPrev;
        uniform sampler2D uLogo;
        uniform vec2 uMouse;
        uniform vec2 uDelta;
        uniform float uTime;
        uniform float uProg;
        varying vec2 vUv;
        // simple value noise
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hash(i), hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)),f.x), f.y);
        }
        void main(){
          vec2 uv = vUv;
          // Mouse-driven advection: pixels near cursor get pushed by -delta
          vec2 toM = uv - uMouse;
          float d = length(toM);
          float infl = exp(-d * 5.0);
          vec2 swirl = vec2(-toM.y, toM.x) * 0.012; // gentle swirl
          vec2 offset = uDelta * 1.6 * infl + swirl * infl;
          // small turbulence based on noise
          float n = noise(uv * 8.0 + uTime * 0.4);
          offset += (vec2(n, 1.0 - n) - 0.5) * 0.0015 * (0.4 + uProg);
          vec3 prev = texture2D(uPrev, uv - offset).rgb * 0.965; // damped feedback
          // Inject logo "ink" — sample logo with alpha
          vec4 logo = texture2D(uLogo, vec2(uv.x, 1.0 - uv.y));
          // Tint logo gradient by uv.x
          vec3 ink = mix(vec3(1.0, 0.45, 0.1), vec3(0.2, 0.95, 0.95), smoothstep(0.2, 0.8, uv.x));
          ink = mix(ink, vec3(1.0, 0.95, 0.85), 0.35);
          ink *= logo.a;
          vec3 mixCol = max(prev, ink * 1.15);
          gl_FragColor = vec4(mixCol, 1.0);
        }`,
        });

        // Display material — show feedback buffer to screen with subtle bloom
        const dispMat = new THREE.ShaderMaterial({
            uniforms: {
                uTex: { value: null },
            },
            vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`,
            fragmentShader: `
        precision highp float;
        uniform sampler2D uTex;
        varying vec2 vUv;
        void main(){
          vec3 c = texture2D(uTex, vUv).rgb;
          // soft bloom via 4-tap blur
          vec3 b = vec3(0.);
          b += texture2D(uTex, vUv + vec2( 0.004, 0.0)).rgb;
          b += texture2D(uTex, vUv + vec2(-0.004, 0.0)).rgb;
          b += texture2D(uTex, vUv + vec2(0.0,  0.004)).rgb;
          b += texture2D(uTex, vUv + vec2(0.0, -0.004)).rgb;
          b *= 0.25;
          vec3 col = c + b * 0.4;
          gl_FragColor = vec4(col, max(c.r, max(c.g, c.b)));
        }`,
            transparent: true,
        });

        const advMesh = new THREE.Mesh(fsGeo, advMat);
        const dispMesh = new THREE.Mesh(fsGeo, dispMat);
        fsScene.add(advMesh);

        const dispScene = new THREE.Scene();
        dispScene.add(dispMesh);

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = 1.0 - (e.clientY - r.top) / r.height;
            state.current.mouse.set(x, y);
        };
        el.addEventListener('pointermove', onMove);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            // Update delta = current - prev
            state.current.delta.subVectors(state.current.mouse, state.current.prevMouse);
            state.current.prevMouse.copy(state.current.mouse);

            advMat.uniforms.uPrev.value = read.texture;
            advMat.uniforms.uMouse.value.copy(state.current.mouse);
            advMat.uniforms.uDelta.value.copy(state.current.delta);
            advMat.uniforms.uTime.value = t;
            advMat.uniforms.uProg.value = state.current.progress;
            advMesh.material = advMat;
            renderer.setRenderTarget(write);
            renderer.render(fsScene, fsCam);
            renderer.setRenderTarget(null);

            dispMat.uniforms.uTex.value = write.texture;
            renderer.render(dispScene, fsCam);

            // swap
            const tmp = read; read = write; write = tmp;
        };
        raf = requestAnimationFrame(tick);

        const onResize = () => {
            renderer.setSize(el.clientWidth, el.clientHeight);
            const s = targetSize();
            rtA.setSize(s.w, s.h);
            rtB.setSize(s.w, s.h);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            rtA.dispose();
            rtB.dispose();
            advMat.dispose();
            dispMat.dispose();
            fsGeo.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.active = active;
    state.current.progress = progress;
    return <div ref={mount} className="absolute inset-0" />;
};

export const V11FluidSmear = () => (
    <VariantShell
        index={11}
        title="Fluid Ink Smear"
        technique="WebGL · Ping-pong feedback · Cursor-driven advection"
        hint="drag the cursor to push ink through the field"
        accent="primary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V11FluidSmear;

