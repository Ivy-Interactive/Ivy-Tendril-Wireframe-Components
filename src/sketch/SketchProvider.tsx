import * as React from "react";

export interface SketchTheme {
  /** How wobbly every stroke is. 0 is a ruler, 3 is a bad pen. */
  roughness: number;
  /** How much straight lines curve on their way. */
  bowing: number;
  strokeWidth: number;
  /** Set to freeze the randomness so re-renders redraw identically. */
  deterministic: boolean;
  /** Applies the turbulence filter to icons and images. */
  wobbleGlyphs: boolean;
}

const DEFAULT_THEME: SketchTheme = {
  roughness: 1.2,
  bowing: 1.4,
  strokeWidth: 1.4,
  deterministic: true,
  wobbleGlyphs: true,
};

const SketchThemeContext = React.createContext<SketchTheme>(DEFAULT_THEME);

export const useSketchTheme = () => React.useContext(SketchThemeContext);

/** SVG filter primitives that give icons, images and text their paper wobble. */
export const SketchDefs = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="0"
    height="0"
    style={{ position: "absolute", pointerEvents: "none" }}
  >
    <defs>
      <filter id="tendril-wobble" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="tendril-wobble-strong" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="19" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <pattern id="tendril-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      </pattern>
    </defs>
  </svg>
);

export interface SketchProviderProps extends Partial<SketchTheme> {
  children?: React.ReactNode;
}

/**
 * Wrap the app once. Supplies the pencil settings every widget draws with and
 * mounts the shared SVG filter definitions.
 */
export const SketchProvider = ({ children, ...overrides }: SketchProviderProps) => {
  const parent = React.useContext(SketchThemeContext);
  const value = React.useMemo<SketchTheme>(
    () => ({ ...parent, ...overrides }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parent, JSON.stringify(overrides)],
  );

  return (
    <SketchThemeContext.Provider value={value}>
      <SketchDefs />
      {children}
    </SketchThemeContext.Provider>
  );
};
