"use client";

// Live shader background tuned for the DS2 brand: pure-grayscale "matte black"
// mesh gradient with subtle motion + grain. Powered by @shadergradient/react
// (Three.js + R3F under the hood). Renders fixed full-viewport behind all
// content. The static .ds-stage CSS layer underneath is the fallback that
// shows before WebGL initializes (or if it fails on a low-end device).

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export function ShaderStage() {
  return (
    <ShaderGradientCanvas
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        // Belt-and-suspenders: force grayscale even if the shader's lighting
        // model leaks any color through. Combined with the .ds-glass-overlay
        // saturate(0) above, color cannot survive to the user's eye.
        filter: "grayscale(1) saturate(0)",
      }}
      pointerEvents="none"
      pixelDensity={1}
      fov={45}
    >
      <ShaderGradient
        control="props"
        type="plane"
        animate="on"
        uTime={0}
        uSpeed={0.05}
        uStrength={1}
        uDensity={1.5}
        uFrequency={0}
        uAmplitude={0}
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        color1="#1A1A1A"
        color2="#0E0E0E"
        color3="#050505"
        reflection={0}
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={2.8}
        cameraZoom={1}
        lightType="3d"
        brightness={1.0}
        envPreset="city"
        grain="on"
        grainBlending={0}
      />
    </ShaderGradientCanvas>
  );
}
