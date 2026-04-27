"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float, Environment, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

function LogoMesh() {
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animate color/glow on hover
  useFrame((state) => {
    if (textRef.current) {
      const material = textRef.current.material as THREE.MeshPhysicalMaterial;
      // Smoothly transition emissive intensity
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        hovered ? 0.8 : 0.0,
        0.1
      );
      
      // Add slight mouse follow rotation on top of Float
      const targetX = (state.pointer.x * Math.PI) / 10;
      const targetY = (state.pointer.y * Math.PI) / 10;
      
      textRef.current.rotation.y = THREE.MathUtils.lerp(textRef.current.rotation.y, targetX, 0.1);
      textRef.current.rotation.x = THREE.MathUtils.lerp(textRef.current.rotation.x, -targetY, 0.1);
    }
  });

  return (
    <Float
      speed={2.5} 
      rotationIntensity={0.2} 
      floatIntensity={0.5}
      floatingRange={[-0.05, 0.05]}
    >
      <Text
        ref={textRef}
        font="/fonts/Inter-Bold.woff" // Uses a default if not found, but we can rely on default for now
        fontSize={1.8}
        letterSpacing={-0.05}
        lineHeight={1}
        textAlign="center"
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        DS
        <meshPhysicalMaterial
          color={hovered ? "#ffffff" : "#e2e8f0"} // text-ink-100 equivalent
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#3b82f6" // A subtle blue glow
          emissiveIntensity={0}
        />
      </Text>
    </Float>
  );
}

export function AnimatedLogo3D() {
  return (
    <div className="h-10 w-20 flex items-center justify-center cursor-pointer relative z-50">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        className="pointer-events-auto"
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <PresentationControls
          global
          snap={true}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 8, Math.PI / 8]}
          azimuth={[-Math.PI / 8, Math.PI / 8]}
        >
          <LogoMesh />
        </PresentationControls>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
