// V02MagneticGrid.jsx — dense regular dot grid; logo visible via dot size; mouse attracts
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';
import { sampleLogo, sampleBrightness } from '@/lib/logoSampler';

const LOGO = '/logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector3(-999, -999, 0), mouseAct: 0, progress: 0 });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 18);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        let points, mat, disposed = false;

        sampleLogo(LOGO, { step: 1, threshold: 150, targetWidth: 800 }).then((sample) => {
            if (disposed) return;
            const COLS = 200;
            const ROWS = Math.round(COLS / sample.aspect * 0.6);
            const SCALE_X = 26;
            const SCALE_Y = SCALE_X / sample.aspect * 0.6;
            const N = COLS * ROWS;
            const pos = new Float32Array(N * 3);
            const rest = new Float32Array(N * 3);
            const color = new Float32Array(N * 3);
            const size = new Float32Array(N);

            const primary = new THREE.Color('hsl(22, 95%, 58%)');
            const dim = new THREE.Color('hsl(225, 20%, 22%)');

            let idx = 0;
            for (let j = 0; j < ROWS; j++) {
                for (let i = 0; i < COLS; i++) {
                    const x = (i / (COLS - 1) - 0.5) * SCALE_X;
                    const y = (0.5 - j / (ROWS - 1)) * SCALE_Y;
                    const u = i / (COLS - 1);
                    const v = j / (ROWS - 1);
                    const br = sampleBrightness(sample, u, v) / 255;
                    pos[idx * 3] = x;
                    pos[idx * 3 + 1] = y;
                    pos[idx * 3 + 2] = 0;
                    rest[idx * 3] = x;
                    rest[idx * 3 + 1] = y;
                    rest[idx * 3 + 2] = 0;
                    const c = dim.clone().lerp(primary, br);
                    color[idx * 3] = c.r;
                    color[idx * 3 + 1] = c.g;
                    color[idx * 3 + 2] = c.b;
                    size[idx] = 0.03 + br * 0.18;
                    idx++;
                }
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('aRest', new THREE.BufferAttribute(rest, 3));
            geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
            geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

            mat = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                uniforms: {
                    uTime: { value: 0 },
                    uMouse: { value: new THREE.Vector3() },
                    uStr: { value: 0 },
                    uProg: { value: 0 },
                    uPixel: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: `
          attribute vec3 aRest; attribute vec3 aColor; attribute float aSize;
          uniform float uTime, uStr, uProg, uPixel; uniform vec3 uMouse;
          varying vec3 vC; varying float vA;
          void main(){
            vec3 pos = aRest;
            vec3 d = pos - uMouse;
            float dist = length(d.xy);
            float pull = smoothstep(4.0, 0.0, dist) * uStr;
            pos.xy -= normalize(d.xy + 0.0001) * pull * 2.0;
            pos.z += sin(dist*1.5 - uTime*3.) * pull * 0.8;
            pos.z += sin(aRest.x*0.3 + uTime*0.8 + aRest.y*0.3) * 0.15;
            vec4 mv = modelViewMatrix * vec4(pos, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (aSize + pull*0.3) * 420. * uPixel / -mv.z;
            vC = aColor;
            vA = mix(0.15, 1., smoothstep(0., 1., aSize*5.)) * (0.35 + 0.65*uProg);
          }`,
                fragmentShader: `
          varying vec3 vC; varying float vA;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0.05, d);
            gl_FragColor = vec4(vC, a * vA);
            if (gl_FragColor.a < 0.01) discard;
          }`,
            });
            points = new THREE.Points(geo, mat);
            scene.add(points);
        });

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 2 - 1;
            const y = -((e.clientY - r.top) / r.height) * 2 + 1;
            const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = v.sub(camera.position).normalize();
            const dist = -camera.position.z / dir.z;
            state.current.mouse.copy(camera.position).add(dir.multiplyScalar(dist));
            state.current.mouseAct = 1;
        };
        const onLeave = () => { state.current.mouseAct = 0; };
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            if (mat) {
                mat.uniforms.uTime.value = t;
                mat.uniforms.uMouse.value.lerp(state.current.mouse, 0.22);
                mat.uniforms.uStr.value += (state.current.mouseAct - mat.uniforms.uStr.value) * 0.08;
                const p = state.current.progress;
                mat.uniforms.uProg.value = Math.min(1, Math.max(0, p * 2 - 0.1));
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

export const V02MagneticGrid = () => (
    <VariantShell
        index={2}
        title="Magnetic Dot Grid"
        technique="WebGL · 200×80 lattice · Cursor pull field"
        hint="hover to pull the lattice · scroll to reveal brightness"
        accent="primary"
    >
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V02MagneticGrid;
