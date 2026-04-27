"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Environment, Instance, Instances } from "@react-three/drei";
import * as THREE from "three";

function Particles() {
  const group = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);

  // Track scroll for parallax
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      scrollRef.current = window.scrollY;
    });
  }

  useFrame((state, delta) => {
    if (group.current) {
      // Gentle constant rotation
      group.current.rotation.y += delta * 0.05;
      group.current.rotation.x += delta * 0.02;
      
      // Parallax effect based on scroll
      const targetY = scrollRef.current * 0.002;
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);
    }
  });

  const particlesCount = 100;
  const dummy = new THREE.Object3D();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < particlesCount; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, []);

  return (
    <group ref={group}>
      <Instances limit={particlesCount} range={particlesCount}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
        {particles.map((data, i) => (
          <Particle key={i} {...data} dummy={dummy} />
        ))}
      </Instances>
    </group>
  );
}

interface ParticleProps {
  factor: number;
  speed: number;
  xFactor: number;
  yFactor: number;
  zFactor: number;
  dummy: THREE.Object3D;
  t: number;
}

function Particle({ factor, speed, xFactor, yFactor, zFactor, dummy, t }: ParticleProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    dummy.position.set(
      xFactor + Math.cos((t / 10) * factor) + (Math.sin(time * speed) * factor) / 10,
      yFactor + Math.sin((t / 10) * factor) + (Math.cos(time * speed) * factor) / 10,
      zFactor + Math.cos((t / 10) * factor) + (Math.sin(time * speed) * factor) / 10
    );
    const s = Math.cos(time);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(s * 5, s * 5, s * 5);
    dummy.updateMatrix();
    if (ref.current) {
      ref.current.matrix.copy(dummy.matrix);
    }
  });
  return <Instance ref={ref} />;
}

export function CanvasBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-ink-950">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
          <Particles />
        </Float>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
