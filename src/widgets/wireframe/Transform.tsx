import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { useMeasuredSize } from "@/sketch/useRough";

/** The anchor a transform pivots and scales around. */
export type TransformOrigin =
  | "Center"
  | "TopLeft"
  | "Top"
  | "TopRight"
  | "Left"
  | "Right"
  | "BottomLeft"
  | "Bottom"
  | "BottomRight";

const ORIGINS: Record<TransformOrigin, string> = {
  Center: "center center",
  TopLeft: "left top",
  Top: "center top",
  TopRight: "right top",
  Left: "left center",
  Right: "right center",
  BottomLeft: "left bottom",
  Bottom: "center bottom",
  BottomRight: "right bottom",
};

type Matrix = [number, number, number, number];

const multiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[1] * b[2],
  a[0] * b[1] + a[1] * b[3],
  a[2] * b[0] + a[3] * b[2],
  a[2] * b[1] + a[3] * b[3],
];

/**
 * The same composition CSS performs for `translate rotate scale skewX skewY`,
 * as a 2x2 matrix. Needed only for `fit`: to size the box to what the child
 * actually covers, the transformed corners have to be computed, not guessed.
 */
function composeMatrix(
  rotate: number,
  sx: number,
  sy: number,
  skewX: number,
  skewY: number,
): Matrix {
  const rad = (rotate * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return multiply(
    multiply(
      multiply([cos, -sin, sin, cos], [sx, 0, 0, sy]),
      [1, Math.tan((skewX * Math.PI) / 180), 0, 1],
    ),
    [1, 0, Math.tan((skewY * Math.PI) / 180), 1],
  );
}

export interface WireframeTransformProps extends WidgetBaseProps {
  /** Clockwise rotation in degrees. */
  rotate?: number;
  /** Uniform scale factor. 1 is unchanged. */
  scale?: number;
  /** Horizontal scale, overriding `scale` on that axis. */
  scaleX?: number;
  /** Vertical scale, overriding `scale` on that axis. */
  scaleY?: number;
  /** Horizontal skew in degrees. */
  skewX?: number;
  /** Vertical skew in degrees. */
  skewY?: number;
  /** Horizontal nudge in pixels. */
  offsetX?: number;
  /** Vertical nudge in pixels. */
  offsetY?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  origin?: TransformOrigin;
  /**
   * Shrinks the widget's own layout box to the transformed bounds, so a scaled
   * or rotated child takes up the room it visually occupies instead of the room
   * it started with. Off by default, which is the plain CSS behaviour. When on,
   * `origin` no longer affects the result — the bounds are recentred either way.
   */
  fit?: boolean;
  /** Fades the children. 1 is opaque. */
  opacity?: number;
  children?: React.ReactNode;
}

/**
 * Renders its children under a transform: rotated, scaled, skewed, flipped or
 * nudged. The transform is visual only — children keep the layout box they
 * started with, so a rotated child does not push its neighbours around. Turn
 * `fit` on when the transformed bounds should take up room.
 * Mirrors `Ivy.WireframeTransform`.
 *
 * @tags rotate scale skew flip tilt
 * @slot children The subtree the transform applies to
 * @example <WireframeTransform rotate={-2}><Card title="Pinned up crooked" /></WireframeTransform>
 * @example <WireframeTransform scale={0.5} fit><WireframeMockup variant="Mobile" /></WireframeTransform>
 */
export const WireframeTransform = ({
  id,
  rotate = 0,
  scale = 1,
  scaleX,
  scaleY,
  skewX = 0,
  skewY = 0,
  offsetX = 0,
  offsetY = 0,
  flipHorizontal,
  flipVertical,
  origin = "Center",
  fit,
  opacity = 1,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeTransformProps) => {
  // Measured only for `fit`, and off the untransformed layout box — which is
  // exactly what has to be fed through the matrix.
  const { ref, width: naturalWidth, height: naturalHeight } = useMeasuredSize<HTMLDivElement>();

  // Per-axis scale falls back to the uniform one; a flip is just a negative
  // scale, so it composes with an explicit scaleX/scaleY rather than fighting it.
  const sx = (scaleX ?? scale) * (flipHorizontal ? -1 : 1);
  const sy = (scaleY ?? scale) * (flipVertical ? -1 : 1);

  const parts: string[] = [];
  if (offsetX !== 0 || offsetY !== 0) parts.push(`translate(${offsetX}px, ${offsetY}px)`);
  if (rotate !== 0) parts.push(`rotate(${rotate}deg)`);
  if (sx !== 1 || sy !== 1) parts.push(`scale(${sx}, ${sy})`);
  if (skewX !== 0) parts.push(`skewX(${skewX}deg)`);
  if (skewY !== 0) parts.push(`skewY(${skewY}deg)`);

  const bounds = React.useMemo(() => {
    if (!fit || naturalWidth <= 0 || naturalHeight <= 0) return null;
    const m = composeMatrix(rotate, sx, sy, skewX, skewY);
    const mapped = [
      [0, 0],
      [naturalWidth, 0],
      [naturalWidth, naturalHeight],
      [0, naturalHeight],
    ].map(([x, y]) => [m[0] * x + m[1] * y + offsetX, m[2] * x + m[3] * y + offsetY]);

    const xs = mapped.map((p) => p[0]);
    const ys = mapped.map((p) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    return { minX, minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
  }, [fit, naturalWidth, naturalHeight, rotate, sx, sy, skewX, skewY, offsetX, offsetY]);

  return (
    <div
      id={id}
      className={cn("inline-block", className)}
      style={{
        opacity: opacity === 1 ? undefined : opacity,
        ...(bounds ? { width: bounds.w, height: bounds.h } : {}),
        ...widgetStyle({ width, height, aspectRatio, visible, style }),
      }}
    >
      <div
        ref={ref}
        className="inline-block"
        style={{
          // Applied in the order translate, rotate, scale, skew, so rotation is
          // about the chosen origin rather than wherever a scale left it.
          transform: bounds
            ? `translate(${-bounds.minX}px, ${-bounds.minY}px) ${parts.join(" ")}`.trim()
            : parts.length
              ? parts.join(" ")
              : undefined,
          // Fitting measures corners from the child's own top-left, so the pivot
          // has to match; origin stops mattering, as the bounds get recentred.
          transformOrigin: bounds ? "0 0" : ORIGINS[origin],
        }}
      >
        {children}
      </div>
    </div>
  );
};
