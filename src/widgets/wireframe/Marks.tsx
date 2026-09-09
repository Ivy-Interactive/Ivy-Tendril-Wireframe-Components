import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor, tint } from "@/sketch/colors";
import { handRng, type Pt } from "@/sketch/hand";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchLayer } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

/**
 * The marks draw in pixel space rather than into a stretched viewBox, so a
 * stroke keeps its weight and its wobble whatever the box is sized to.
 */
const overlayClass = "pointer-events-none absolute inset-0 h-full w-full overflow-visible";

export interface WireframePlaceholderProps extends WidgetBaseProps {
  /** Label drawn across the middle, breaking the diagonals. */
  text?: string;
  color?: string;
}

/**
 * The crossed box that stands in for content nobody has drawn yet.
 * Mirrors `Ivy.WireframePlaceholder`.
 *
 * @tags annotation stub todo empty
 * @example <WireframePlaceholder text="Hero image" />
 * @example <WireframePlaceholder text="Chart goes here" color="Sky" width="20rem" />
 */
export const WireframePlaceholder = ({
  id,
  text,
  color = "Violet",
  density = "Medium",
  width = 60,
  height = 35,
  aspectRatio,
  visible,
  className,
  style,
}: WireframePlaceholderProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const strokeWidth = byDensity(density, [1.2, 1.6, 2.1]);
  const wash = tint(accent, 0.9);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchLayer
        width={w}
        height={h}
        corner="sharp"
        stroke={accent}
        strokeWidth={strokeWidth}
        fill={wash}
        fillStyle="solid"
        seed={id ?? text ?? "placeholder"}
        doubleStroke
      />
      {w > 0 && h > 0 && (
        <svg aria-hidden="true" className={overlayClass}>
          <RoughShape
            shape={{ kind: "line", x1: 2, y1: 2, x2: w - 2, y2: h - 2 }}
            seed={`${id}-diagonal-down`}
            stroke={accent}
            strokeWidth={strokeWidth}
          />
          <RoughShape
            shape={{ kind: "line", x1: w - 2, y1: 2, x2: 2, y2: h - 2 }}
            seed={`${id}-diagonal-up`}
            stroke={accent}
            strokeWidth={strokeWidth}
          />
        </svg>
      )}
      {text && (
        // The wash behind the label is what makes the diagonals look like they
        // pass behind the text rather than through it.
        <span
          className={cn(
            "relative z-[1] px-2.5 py-0.5 text-center font-bold break-words whitespace-pre-wrap select-none",
            byDensity(density, ["text-[11px]", "text-xs", "text-base"]),
          )}
          style={{ background: wash, color: accent }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export interface WireframeRedXProps extends WidgetBaseProps {
  color?: string;
}

/**
 * A marker X struck over a region — this part is wrong, or cut.
 * Mirrors `Ivy.WireframeRedX`.
 *
 * @tags annotation reject cross-out
 * @example <WireframeRedX width="12rem" height="6rem" />
 */
export const WireframeRedX = ({
  id,
  color = "Red",
  density = "Medium",
  width = 50,
  height = 25,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeRedXProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  // Heavy enough to read as a marker rather than a pencil, scaled gently with
  // the box so a small X is not hairline and a large one is not a blob.
  const weight =
    byDensity(density, [3.5, 5, 7]) * Math.max(0.75, Math.min(1.6, Math.min(w, h) / 100));
  const inset = weight + 2;

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {w > inset * 2 && h > inset * 2 && (
        <svg aria-hidden="true" className={overlayClass}>
          <RoughShape
            shape={{ kind: "line", x1: inset, y1: inset, x2: w - inset, y2: h - inset }}
            seed={`${id}-x-down`}
            stroke={accent}
            strokeWidth={weight}
            roughness={1.5}
          />
          <RoughShape
            shape={{ kind: "line", x1: w - inset, y1: inset, x2: inset, y2: h - inset }}
            seed={`${id}-x-up`}
            stroke={accent}
            strokeWidth={weight}
            roughness={1.5}
          />
        </svg>
      )}
    </div>
  );
};

export interface WireframeScratchOutProps extends WidgetBaseProps {
  color?: string;
}

/**
 * One back-and-forth pass across the box: x advances while y flips between the
 * top and bottom edges, so the pen lays down near-vertical strokes joined by
 * looping turns. `offset` staggers the passes against each other.
 */
function scribble(
  w: number,
  h: number,
  strokeWidth: number,
  offset: number,
  rnd: () => number,
): Pt[] {
  const margin = strokeWidth * 1.1;
  const left = margin;
  const right = w - margin;
  const top = margin;
  const bottom = h - margin;
  if (right <= left || bottom <= top) return [];

  const spacing = strokeWidth * 1.8;
  const columns = Math.max(4, Math.round((right - left) / spacing));
  const step = (right - left) / columns;
  // A slight rightward lean at the top, the way a hand pulls the stroke over.
  const lean = Math.min(w * 0.05, 10);
  const slack = (bottom - top) * 0.08;

  const points: Pt[] = [];
  for (let i = 0; i <= columns; i++) {
    const atTop = i % 2 === 0;
    const x = left + i * step + offset + (rnd() - 0.5) * step * 0.4 + (atTop ? lean : -lean) * 0.5;
    points.push([Math.max(0, Math.min(w, x)), atTop ? top + rnd() * slack : bottom - rnd() * slack]);
  }
  return points;
}

/**
 * A scribbled-over region — struck through, but still legible underneath.
 * Mirrors `Ivy.WireframeScratchOut`.
 *
 * @tags annotation strike delete scribble
 * @example <WireframeScratchOut width="14rem" height="4rem" />
 */
export const WireframeScratchOut = ({
  id,
  color = "Black",
  density = "Medium",
  width = 50,
  height = 25,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeScratchOutProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const strokeWidth = byDensity(density, [2.5, 4, 5.5]);

  // Three overlapping passes, each offset by a third of a column. A single
  // zigzag reads as a tidy spring; the overlap is what fills the area in.
  const passes = React.useMemo(() => {
    if (w <= 0 || h <= 0) return [];
    const spacing = strokeWidth * 1.8;
    return [0, spacing / 3, (spacing * 2) / 3]
      .map((offset, index) => scribble(w, h, strokeWidth, offset, handRng(`${id}-pass-${index}`)))
      .filter((points) => points.length > 1);
  }, [w, h, id, strokeWidth]);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {passes.length > 0 && (
        <svg aria-hidden="true" className={overlayClass}>
          {passes.map((points, index) => (
            <RoughShape
              key={index}
              shape={{ kind: "curve", points }}
              seed={`${id}-scratch-${index}`}
              stroke={accent}
              strokeWidth={index === 0 ? strokeWidth : strokeWidth * 0.9}
              opacity={index === 0 ? 1 : 0.85}
            />
          ))}
        </svg>
      )}
    </div>
  );
};
