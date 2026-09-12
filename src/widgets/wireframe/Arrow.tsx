import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";
import { barbsAt, bendPoints, handRng, type Pt } from "@/sketch/hand";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export type ArrowHeads = "None" | "Start" | "End" | "Both";

export type ArrowBend = "None" | "Left" | "Right";

export type ArrowDirection =
  | "Right"
  | "Left"
  | "Up"
  | "Down"
  | "UpLeft"
  | "UpRight"
  | "DownLeft"
  | "DownRight";

/** Where the shaft starts and ends inside the box, for each direction. */
function endpointsFor(direction: ArrowDirection, w: number, h: number, inset: number): [Pt, Pt] {
  const left = inset;
  const right = w - inset;
  const top = inset;
  const bottom = h - inset;
  const cx = w / 2;
  const cy = h / 2;

  switch (direction) {
    case "Left":
      return [[right, cy], [left, cy]];
    case "Up":
      return [[cx, bottom], [cx, top]];
    case "Down":
      return [[cx, top], [cx, bottom]];
    case "UpLeft":
      return [[right, bottom], [left, top]];
    case "UpRight":
      return [[left, bottom], [right, top]];
    case "DownLeft":
      return [[right, top], [left, bottom]];
    case "DownRight":
      return [[left, top], [right, bottom]];
    default:
      return [[left, cy], [right, cy]];
  }
}

export interface WireframeArrowProps extends WidgetBaseProps {
  color?: string;
  /** Which way the shaft runs across the box. */
  direction?: ArrowDirection;
  /** Which end (or both) gets a head. */
  heads?: ArrowHeads;
  /** Bows the shaft off the straight line, to either side. */
  bend?: ArrowBend;
  dashed?: boolean;
}

/**
 * A drawn-on arrow, for pointing one part of a sketch at another.
 * Mirrors `Ivy.WireframeArrow`.
 *
 * @tags annotation pointer connector leader
 * @example <WireframeArrow direction="Right" />
 * @example <WireframeArrow direction="DownRight" bend="Left" heads="Both" dashed />
 */
export const WireframeArrow = ({
  id,
  color = "Black",
  direction = "Right",
  heads = "End",
  bend = "None",
  dashed,
  density = "Medium",
  width = 40,
  height = 15,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeArrowProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const strokeWidth = byDensity(density, [1.8, 2.5, 3.5]);
  const headSize = byDensity(density, [11, 14, 18]);

  const geometry = React.useMemo(() => {
    if (w <= 0 || h <= 0) return null;

    const [from, to] = endpointsFor(direction, w, h, strokeWidth + 2);
    const span = Math.hypot(to[0] - from[0], to[1] - from[1]);
    if (span < 4) return null;

    const amount =
      bend === "None"
        ? 0
        : Math.min(span * 0.22, Math.min(w, h) * 0.9) * (bend === "Left" ? -1 : 1);
    const shaft = bendPoints(from, to, amount);

    // The barbs are aimed along the last stretch of the shaft rather than at
    // the endpoints, so a bent arrow's head follows the curve round.
    const rnd = handRng(`${id}-heads`);
    const barbs: Array<[Pt, Pt]> = [];
    if (heads === "End" || heads === "Both") {
      barbs.push(...barbsAt(to, shaft[shaft.length - 3] ?? from, headSize, rnd));
    }
    if (heads === "Start" || heads === "Both") {
      barbs.push(...barbsAt(from, shaft[2] ?? to, headSize, rnd));
    }

    return { shaft, barbs };
  }, [w, h, id, direction, heads, bend, strokeWidth, headSize]);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {geometry && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <RoughShape
            shape={{ kind: "curve", points: geometry.shaft }}
            seed={`${id}-shaft`}
            stroke={accent}
            strokeWidth={strokeWidth}
            strokeLineDash={dashed ? [headSize * 0.75, headSize * 0.5] : undefined}
          />
          {geometry.barbs.map(([tip, end], index) => (
            <RoughShape
              key={index}
              shape={{ kind: "line", x1: tip[0], y1: tip[1], x2: end[0], y2: end[1] }}
              seed={`${id}-barb-${index}`}
              stroke={accent}
              strokeWidth={strokeWidth}
            />
          ))}
        </svg>
      )}
    </div>
  );
};
