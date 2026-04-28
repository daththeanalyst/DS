// V27Lithograph.jsx — 1-bit Bayer-matrix dithered render of an extruded
// rotating DS2 logo. Newspaper / RISO printing aesthetic. Cursor moves the
// light source which redraws the dither pattern.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import VariantShell from '@/components/variants/VariantShell';

const LOGO = import.meta.env.BASE_URL + 'logos/ds2-a.png';

const Scene = ({ progress, active }) => {
    const mount = useRef(null);
    const state = useRef({ mouse: new THREE.Vector2(0.5, 0.5), progress: 0, active: false });

    useEffect(() => {
        const el = mount.current;
        if (!el) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const sceneA = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, 0.1, 100);
        cam.position.set(0, 0, 7);

        const rt = new THREE.WebGLRenderTarget(
            el.clientWidth, el.clientHeight,
            { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
        );

        // Logo texture used as alpha for an extruded plane
        const logoTex = new THREE.TextureLoader().load(LOGO);

        // Three layered planes give a poor-man's extrusion (z-stacked)
        const group = new THREE.Group();
        for (let i = 0; i < 7; i++) {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(5, 5 * 0.4),
                new THREE.MeshLambertMaterial({ map: logoTex, transparent: true, alphaTest: 0.4 })
            );
            m.position.z = (i - 3) * 0.05;
            group.add(m);
        }
        sceneA.add(group);

        const key = new THREE.PointLight(0xffffff, 8, 30);
        key.position.set(3, 3, 4);
        sceneA.add(key);
        sceneA.add(new THREE.AmbientLight(0x404060, 0.5));

        // Background pad (subtle)
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshBasicMaterial({ color: 0x0a0d10 })
        );
        bg.position.z = -3;
        sceneA.add(bg);

        // Dither post-process
        const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const dither = new THREE.ShaderMaterial({
            uniforms: {
                uTex: { value: rt.texture },
                uResolution: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
                uPixel: { value: 2.0 },
                uInk: { value: new THREE.Color(0.92, 0.95, 1.0) },
                uPaper: { value: new THREE.Color(0.04, 0.05, 0.07) },
            },
            vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uTex;
                uniform vec2 uResolution;
                uniform float uPixel;
                uniform vec3 uInk, uPaper;

                // 8x8 Bayer matrix
                float bayer(ivec2 p){
                    int M[64];
                    M[0]= 0; M[1]=32; M[2]= 8; M[3]=40; M[4]= 2; M[5]=34; M[6]=10; M[7]=42;
                    M[8]=48; M[9]=16; M[10]=56; M[11]=24; M[12]=50; M[13]=18; M[14]=58; M[15]=26;
                    M[16]=12; M[17]=44; M[18]= 4; M[19]=36; M[20]=14; M[21]=46; M[22]= 6; M[23]=38;
                    M[24]=60; M[25]=28; M[26]=52; M[27]=20; M[28]=62; M[29]=30; M[30]=54; M[31]=22;
                    M[32]= 3; M[33]=35; M[34]=11; M[35]=43; M[36]= 1; M[37]=33; M[38]= 9; M[39]=41;
                    M[40]=51; M[41]=19; M[42]=59; M[43]=27; M[44]=49; M[45]=17; M[46]=57; M[47]=25;
                    M[48]=15; M[49]=47; M[50]= 7; M[51]=39; M[52]=13; M[53]=45; M[54]= 5; M[55]=37;
                    M[56]=63; M[57]=31; M[58]=55; M[59]=23; M[60]=61; M[61]=29; M[62]=53; M[63]=21;
                    int idx = (p.y % 8) * 8 + (p.x % 8);
                    return float(M[idx]) / 64.0;
                }

                float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

                void main(){
                    vec2 px = floor(vUv * uResolution / uPixel);
                    vec2 sUv = (px * uPixel + uPixel * 0.5) / uResolution;
                    vec3 src = texture2D(uTex, sUv).rgb;
                    float L = lum(src);
                    float threshold = bayer(ivec2(int(px.x), int(px.y)));
                    float bit = L > threshold ? 1.0 : 0.0;
                    vec3 col = mix(uPaper, uInk, bit);
                    gl_FragColor = vec4(col, 1.0);
                }`,
        });
        const sceneB = new THREE.Scene();
        sceneB.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), dither));

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            state.current.mouse.set((e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height);
        };
        el.addEventListener('pointermove', onMove);

        const onResize = () => {
            const w = el.clientWidth, h = el.clientHeight;
            renderer.setSize(w, h);
            cam.aspect = w / h;
            cam.updateProjectionMatrix();
            rt.setSize(w, h);
            dither.uniforms.uResolution.value.set(w, h);
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let raf;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            if (!state.current.active) return;
            const t = clock.getElapsedTime();
            // light follows cursor
            const mx = state.current.mouse.x, my = state.current.mouse.y;
            key.position.set((mx - 0.5) * 8, (my - 0.5) * 5, 4);
            group.rotation.y = Math.sin(t * 0.4) * 0.5 + state.current.progress * 0.6;
            group.rotation.x = Math.cos(t * 0.3) * 0.2;
            renderer.setRenderTarget(rt);
            renderer.render(sceneA, cam);
            renderer.setRenderTarget(null);
            renderer.render(sceneB, orthoCam);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            el.removeEventListener('pointermove', onMove);
            rt.dispose();
            logoTex.dispose();
            group.children.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
            bg.geometry.dispose(); bg.material.dispose();
            dither.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
    }, []);

    state.current.progress = progress;
    state.current.active = active;
    return <div ref={mount} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />;
};

export const V27Lithograph = () => (
    <VariantShell index={27} title="Lithograph" technique="WebGL · Bayer 8×8 Dither · 1-bit Post-Process" hint="cursor moves the light · scroll rotates the logo">
        {({ progress, active }) => <Scene progress={progress} active={active} />}
    </VariantShell>
);

export default V27Lithograph;
