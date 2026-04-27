import "./index.css";
import { AbsoluteFill, Composition } from "remotion";

/**
 * The Remotion project is kept around as DS infrastructure but currently
 * has no compositions — past hero experiments (LaptopArc / CodeManifesto /
 * MacBookHero) were removed when we pivoted away from scroll-scrubbed video.
 * Add a new composition here when needed.
 */
const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#0a0a0a",
      color: "#9a9a9a",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      fontSize: 32,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    DS — motion editor (no compositions yet)
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Placeholder"
      component={Placeholder}
      durationInFrames={60}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
