import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { STROKE, resolveColor, tint } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

export interface WireframeNoteProps extends WidgetBaseProps {
  text?: string;
  color?: string;
  children?: React.ReactNode;
}

/**
 * A sticky note pinned to the wireframe. Mirrors `Ivy.WireframeNote`.
 *
 * @tags annotation sticky comment
 * @example <WireframeNote text="Copy still to be written." />
 */
export const WireframeNote = ({
  id,
  text,
  color = "Amber",
  width = "12rem",
  height,
  aspectRatio,
  visible,
  children,
  className,
  style,
}: WireframeNoteProps) => {
  const accent = resolveColor(color);

  return (
    <SketchFrame
      id={id}
      seed={id ?? text ?? "note"}
      corner="sharp"
      stroke={accent}
      strokeWidth={STROKE.regular}
      fill={tint(accent, 0.82)}
      fillStyle="solid"
      className={cn("inline-block rotate-[-1.2deg] shadow-[2px_3px_0_0_rgba(47,47,47,0.12)]", className)}
      contentClassName="block p-3 text-sm leading-snug"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {children ?? text}
    </SketchFrame>
  );
};

export interface WireframeCalloutProps extends WidgetBaseProps {
  /** Short marker text, e.g. `"1"` or `"A"`. */
  label?: string;
  color?: string;
  /** Draws a leader line pointing this many pixels to the right. */
  leader?: number;
  children?: React.ReactNode;
}

/**
 * A numbered marker for annotating a wireframe. Mirrors `Ivy.WireframeCallout`.
 *
 * @tags annotation marker numbered
 * @example <WireframeCallout label="1" leader={60}>Primary action</WireframeCallout>
 */
export const WireframeCallout = ({
  id,
  label = "1",
  color = "Destructive",
  leader,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeCalloutProps) => {
  const accent = resolveColor(color);
  const { ref, width: leaderWidth } = useMeasuredSize<HTMLSpanElement>();

  return (
    <span
      id={id}
      className={cn("inline-flex items-center gap-2 align-middle", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? `callout-${label}`}
        corner="ellipse"
        stroke={accent}
        strokeWidth={STROKE.emphasis}
        fill={tint(accent, 0.85)}
        fillStyle="solid"
        className="inline-block shrink-0"
        contentClassName="flex h-full w-full items-center justify-center"
        style={{ width: 24, height: 24 }}
      >
        <span className="text-xs font-bold" style={{ color: accent }}>
          {label}
        </span>
      </SketchFrame>
      {leader ? (
        <span ref={ref} className="relative inline-block h-[3px]" style={{ width: leader }}>
          {leaderWidth > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
              <RoughShape
                shape={{ kind: "line", x1: 0, y1: 1, x2: leaderWidth, y2: 1 }}
                seed={`${id}-leader`}
                stroke={accent}
                strokeWidth={STROKE.regular}
                roughness={1.6}
              />
            </svg>
          )}
        </span>
      ) : null}
      {children && <span className="text-sm" style={{ color: accent }}>{children}</span>}
    </span>
  );
};

