"use client";

// Lazy loader for the shader background. The actual @shadergradient/react
// + Three + R3F bundle (~1 MB) only downloads on the client after first
// paint, so the static .ds-stage CSS is what users see during the load.
// Once the chunk is ready, the shader fades in and takes over.

import dynamic from "next/dynamic";

const ShaderStageInner = dynamic(
  () => import("./shader-stage-inner").then((m) => m.ShaderStage),
  { ssr: false },
);

export function ShaderStage() {
  return <ShaderStageInner />;
}
