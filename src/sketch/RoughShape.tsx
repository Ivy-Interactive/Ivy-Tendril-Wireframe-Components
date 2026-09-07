import * as React from "react";
import { seedFrom } from "@/lib/utils";
import { INK } from "./colors";
import { useSketchTheme } from "./SketchProvider";
import { useRoughPaths, type RoughOptions, type SketchShape } from "./useRough";

export interface RoughShapeProps {
  shape: SketchShape;
  stroke?: string | "none";
  strokeWidth?: number;
  fill?: string;
  fillStyle?: RoughOptions["fillStyle"];
  fillWeight?: number;
  hachureAngle?: number;
  hachureGap?: number;
  roughness?: number;
  bowing?: number;
  seed?: string | number;
  opacity?: number;
  strokeLineDash?: number[];
  className?: string;
  onClick?: React.MouseEventHandler<SVGGElement>;
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
}

/**
 * Draws a rough.js shape inside an existing `<svg>`. Used by the charts and by
 * any widget that needs sketch geometry rather than a sketch border.
 */
export const RoughShape = ({
  shape,
  stroke = INK,
  strokeWidth,
  fill,
  fillStyle = "hachure",
  fillWeight,
  hachureAngle,
  hachureGap,
  roughness,
  bowing,
  seed,
  opacity,
  strokeLineDash,
  className,
  ...handlers
}: RoughShapeProps) => {
  const theme = useSketchTheme();
  const sw = strokeWidth ?? theme.strokeWidth;

  const options = React.useMemo<RoughOptions>(
    () => ({
      stroke,
      strokeWidth: sw,
      roughness: roughness ?? theme.roughness,
      bowing: bowing ?? theme.bowing,
      fill,
      fillStyle,
      fillWeight: fillWeight ?? sw / 2,
      hachureAngle: hachureAngle ?? -41,
      ...(hachureGap ? { hachureGap } : {}),
      seed: theme.deterministic ? seedFrom(seed) : undefined,
      disableMultiStroke: true,
      preserveVertices: true,
      ...(strokeLineDash ? { strokeLineDash } : {}),
    }),
    [
      stroke,
      sw,
      roughness,
      bowing,
      fill,
      fillStyle,
      fillWeight,
      hachureAngle,
      hachureGap,
      seed,
      strokeLineDash,
      theme.roughness,
      theme.bowing,
      theme.deterministic,
    ],
  );

  const paths = useRoughPaths(shape, options);

  return (
    <g className={className} opacity={opacity} {...handlers}>
      {paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fill={path.fill ?? "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};
