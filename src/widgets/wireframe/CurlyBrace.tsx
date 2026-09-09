import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";
import { handRng, type Pt } from "@/sketch/hand";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

/**
 * Which way the brace's centre nub points. This follows the wireframing
 * convention the widget is modelled on: the name is the direction of the nub,
 * not of the span. A `Horizontal` brace is the familiar `{` — it spans
 * downwards with the nub pointing left.
 */
export type CurlyBraceVariant = "Horizontal" | "Vertical";

/**
 * The brace in a canonical frame: it spans downwards along y from 0 to
 * `length`, with the nub pointing towards -x at `depth`. Both variants are
 * this one shape mapped into place, which keeps them from drifting apart.
 *
 * The pair of anchors either side of the nub is what keeps the centre a crisp
 * point — a single anchor there gets rounded off into a shapeless bulge.
 */
function braceAnchors(length: number, depth: number, rnd: () => number): Pt[] {
  const arm = depth * 0.46;
  const jitter = () => (rnd() - 0.5) * 1.4;

  return [
    [0 + jitter(), 0],
    [-arm * 0.85 + jitter(), length * 0.08 + jitter()],
    [-arm + jitter(), length * 0.3 + jitter()],
    [-arm * 0.95 + jitter(), length * 0.43 + jitter()],
    [-depth, length * 0.5],
    [-arm * 0.95 + jitter(), length * 0.57 + jitter()],
    [-arm + jitter(), length * 0.7 + jitter()],
    [-arm * 0.85 + jitter(), length * 0.92 + jitter()],
    [0 + jitter(), length],
  ];
}

export interface WireframeCurlyBraceProps extends WidgetBaseProps {
  /** Direction the centre nub points, not the direction of the span. */
  variant?: CurlyBraceVariant;
  color?: string;
}

/**
 * A brace gathering a run of the sketch together, to be labelled as one thing.
 * Mirrors `Ivy.WireframeCurlyBrace`.
 *
 * @tags annotation group span bracket
 * @example <WireframeCurlyBrace height="12rem" />
 * @example <WireframeCurlyBrace variant="Vertical" width="16rem" />
 */
export const WireframeCurlyBrace = ({
  id,
  variant = "Horizontal",
  color = "Black",
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeCurlyBraceProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const strokeWidth = byDensity(density, [1.8, 2.4, 3.2]);

  const points = React.useMemo(() => {
    if (w <= 0 || h <= 0) return null;

    const inset = strokeWidth + 1;
    // Horizontal: the nub points left, so the brace spans the height and the
    // width is its depth. Vertical is the same shape turned a quarter.
    const length = (variant === "Vertical" ? w : h) - inset * 2;
    const depth = (variant === "Vertical" ? h : w) - inset * 2;
    if (length < 8 || depth < 4) return null;

    return braceAnchors(length, depth, handRng(`${id}-brace`)).map(
      ([cx, cy]): Pt =>
        variant === "Vertical"
          ? [inset + cy, inset + depth + cx]
          : [inset + depth + cx, inset + cy],
    );
  }, [w, h, id, variant, strokeWidth]);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={widgetStyle({
        width: width ?? (variant === "Vertical" ? 35 : 7),
        height: height ?? (variant === "Vertical" ? 7 : 35),
        aspectRatio,
        visible,
        style,
      })}
    >
      {points && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <RoughShape
            shape={{ kind: "curve", points }}
            seed={`${id}-brace`}
            stroke={accent}
            strokeWidth={strokeWidth}
          />
        </svg>
      )}
    </div>
  );
};
