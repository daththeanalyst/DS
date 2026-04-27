import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Hero3D: "DS2" letters built from particles. Mouse-reactive, entrance assembly,
// cinematic lighting & cursor distortion field. Pure Three.js (no drei).
export const Hero3D = ({ onReady }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x07090f, 0.05);

        const camera = new THREE.PerspectiveCamera(
            55,
            container.clientWidth / container.clientHeight,
            0.1,
            200
        );
        camera.position.set(0, 0, 18);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Generate target particle positions from "DS2" text rendered to canvas
        const generateTargets = () => {
            const c = document.createElement('canvas');
            const FONT_PX = 520;
            c.width = 1800;
            c.height = 720;
            const cx = c.getContext('2d');
            cx.fillStyle = '#000';
            cx.fillRect(0, 0, c.width, c.height);
            cx.fillStyle = '#fff';
            cx.font = `900 ${FONT_PX}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`;
            cx.textAlign = 'center';
            cx.textBaseline = 'middle';
            cx.fillText('DS2', c.width / 2, c.height / 2);
            const data = cx.getImageData(0, 0, c.width, c.height).data;
            const targets = [];
            const step = 4; // sampling step (lower = more particles)
            for (let y = 0; y < c.height; y += step) {
                for (let x = 0; x < c.width; x += step) {
                    const i = (y * c.width + x) * 4;
                    if (data[i] > 128) {
                        // Map canvas to 3D space
                        const px = (x - c.width / 2) / c.width * 22;
                        const py = -(y - c.height / 2) / c.height * 9;
                        const pz = (Math.random() - 0.5) * 0.6;
                        targets.push(px, py, pz);
                    }
                }
            }
            return new Float32Array(targets);
        };

        // Wait for fonts so geometry matches Space Grotesk
        const buildScene = (targets) => {
            const count = targets.length / 3;

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const startPositions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const offsets = new Float32Array(count);

            const colorEmber = new THREE.Color('hsl(22, 95%, 60%)');
            const colorFrost = new THREE.Color('hsl(175, 85%, 60%)');
            const colorWhite = new THREE.Color('hsl(36, 30%, 96%)');

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                // Random start: scattered cloud far away
                const radius = 30 + Math.random() * 50;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                startPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                startPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                startPositions[i3 + 2] = radius * Math.cos(phi) - 20;

                positions[i3] = startPositions[i3];
                positions[i3 + 1] = startPositions[i3 + 1];
                positions[i3 + 2] = startPositions[i3 + 2];

                // Color mix based on x position (left=ember, right=frost)
                const t = (targets[i3] + 11) / 22;
                const c = new THREE.Color().lerpColors(colorEmber, colorFrost, t);
                if (Math.random() < 0.15) c.lerp(colorWhite, 0.7);
                colors[i3] = c.r;
                colors[i3 + 1] = c.g;
                colors[i3 + 2] = c.b;

                sizes[i] = Math.random() * 0.05 + 0.045;
                offsets[i] = Math.random();
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
            geometry.setAttribute('aStart', new THREE.BufferAttribute(startPositions, 3));
            geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

            const material = new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uProgress: { value: 0 },
                    uMouse: { value: new THREE.Vector3(0, 0, 0) },
                    uMouseStrength: { value: 0 },
                    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                },
                vertexShader: /* glsl */ `
                    attribute vec3 aTarget;
                    attribute vec3 aStart;
                    attribute vec3 aColor;
                    attribute float aSize;
                    attribute float aOffset;

                    uniform float uTime;
                    uniform float uProgress;
                    uniform vec3 uMouse;
                    uniform float uMouseStrength;
                    uniform float uPixelRatio;

                    varying vec3 vColor;
                    varying float vAlpha;

                    // Cubic ease
                    float ease(float t) { return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0)/2.0; }

                    void main() {
                        float p = clamp(uProgress + (aOffset - 0.5) * 0.35, 0.0, 1.0);
                        float ep = ease(p);
                        vec3 pos = mix(aStart, aTarget, ep);

                        // Subtle wobble around target
                        float wob = (1.0 - ep) * 0.0 + ep * 0.15;
                        pos.x += sin(uTime * 1.2 + aOffset * 12.0) * wob * 0.4;
                        pos.y += cos(uTime * 1.4 + aOffset * 10.0) * wob * 0.4;
                        pos.z += sin(uTime * 0.9 + aOffset * 8.0) * wob * 0.6;

                        // Mouse distortion field (only when assembled)
                        vec3 toMouse = pos - uMouse;
                        float d = length(toMouse.xy);
                        float force = smoothstep(4.5, 0.0, d) * uMouseStrength * ep;
                        pos.xy += normalize(toMouse.xy + 0.0001) * force * 1.6;
                        pos.z += force * 1.2;

                        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                        gl_Position = projectionMatrix * mv;
                        gl_PointSize = aSize * 280.0 * uPixelRatio / -mv.z;

                        vColor = aColor;
                        vAlpha = mix(0.0, 1.0, ep);
                    }
                `,
                fragmentShader: /* glsl */ `
                    varying vec3 vColor;
                    varying float vAlpha;
                    void main() {
                        vec2 uv = gl_PointCoord - 0.5;
                        float d = length(uv);
                        float alpha = smoothstep(0.5, 0.0, d);
                        // Soft glow
                        alpha *= alpha;
                        gl_FragColor = vec4(vColor, alpha * vAlpha * 0.95);
                        if (gl_FragColor.a < 0.01) discard;
                    }
                `,
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // Subtle accent halos
            const haloGeo = new THREE.PlaneGeometry(40, 40);
            const haloMat1 = new THREE.MeshBasicMaterial({
                color: new THREE.Color('hsl(22, 95%, 58%)'),
                transparent: true,
                opacity: 0.18,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const halo1 = new THREE.Mesh(haloGeo, haloMat1);
            halo1.position.set(-10, -2, -5);
            scene.add(halo1);

            const haloMat2 = new THREE.MeshBasicMaterial({
                color: new THREE.Color('hsl(175, 85%, 55%)'),
                transparent: true,
                opacity: 0.16,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const halo2 = new THREE.Mesh(haloGeo, haloMat2);
            halo2.position.set(10, 2, -5);
            scene.add(halo2);

            return { geometry, material, points };
        };

        let geometry, material, points;
        let mouse = new THREE.Vector2(-1000, -1000);
        let target3D = new THREE.Vector3();
        let progressStart = performance.now();
        let progressDuration = 2400;
        let parallax = { x: 0, y: 0 };

        const init = () => {
            const targets = generateTargets();
            const built = buildScene(targets);
            geometry = built.geometry;
            material = built.material;
            points = built.points;
            if (onReady) onReady();
        };

        // Use document.fonts to ensure Space Grotesk loaded; fallback after timeout.
        if (document.fonts && document.fonts.ready) {
            const timeout = new Promise((res) => setTimeout(res, 1500));
            Promise.race([document.fonts.ready, timeout]).then(init);
        } else {
            init();
        }

        // Mouse handling
        const onMouseMove = (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            mouse.set(x, y);
            // Project mouse to 3D space at z=0
            const v = new THREE.Vector3(x, y, 0.5).unproject(camera);
            const dir = v.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            target3D.copy(camera.position).add(dir.multiplyScalar(distance));
            parallax.x = x;
            parallax.y = y;
        };

        const onMouseLeave = () => {
            mouse.set(-1000, -1000);
            target3D.set(1000, 1000, 0);
        };

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        // Touch fallback
        const onTouch = (e) => {
            if (!e.touches || !e.touches[0]) return;
            const t = e.touches[0];
            onMouseMove({ clientX: t.clientX, clientY: t.clientY });
        };
        container.addEventListener('touchmove', onTouch, { passive: true });

        // Scroll-based camera dolly
        let scrollY = 0;
        const onScroll = () => { scrollY = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });

        const clock = new THREE.Clock();
        let raf;

        const tick = () => {
            const t = clock.getElapsedTime();

            if (material) {
                material.uniforms.uTime.value = t;
                const elapsed = performance.now() - progressStart;
                const p = Math.min(1, Math.max(0, elapsed / progressDuration));
                material.uniforms.uProgress.value = p;
                // Mouse strength ramps up after assembly
                const target = mouse.x !== -1000 ? 1 : 0;
                material.uniforms.uMouseStrength.value +=
                    (target * p - material.uniforms.uMouseStrength.value) * 0.08;
                // Lerp mouse 3D pos
                material.uniforms.uMouse.value.lerp(target3D, 0.18);
            }

            // Camera parallax
            camera.position.x += (parallax.x * 1.5 - camera.position.x) * 0.04;
            camera.position.y += (parallax.y * 0.8 - camera.position.y) * 0.04;
            // Scroll dolly
            const scrollFactor = Math.min(1, scrollY / window.innerHeight);
            camera.position.z = 18 + scrollFactor * 4;
            camera.lookAt(0, 0, 0);

            // Slight rotation
            if (points) {
                points.rotation.y = parallax.x * 0.18;
                points.rotation.x = -parallax.y * 0.1;
            }

            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        const onResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
            if (material) {
                material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
            }
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onScroll);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
            container.removeEventListener('touchmove', onTouch);
            cancelAnimationFrame(raf);
            if (geometry) geometry.dispose();
            if (material) material.dispose();
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        };
    }, [onReady]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full"
            aria-label="DS2 3D animated logo"
        />
    );
};

export default Hero3D;
