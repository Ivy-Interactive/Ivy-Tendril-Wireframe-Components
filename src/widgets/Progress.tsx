import { byDensity, cn, sizeStyle } from "@/lib/utils";
import type { Densities, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, resolveColor, seriesColor } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

export interface ProgressProps extends WidgetBaseProps {
  /** 0 – 100. Ignored when `indeterminate`. */
  value?: number;
  /** Caption under the bar, e.g. `"3 of 8 uploaded"`. */
  goal?: string;
  color?: string;
  width?: Sizing;
  indeterminate?: boolean;
  density?: Densities;
}

/** A pencilled progress bar. Mirrors `Ivy.Progress`. */
export const Progress = ({
  id,
  value = 0,
  goal,
  color,
  width = "100%",
  indeterminate,
  density = "Medium",
  className,
  style,
}: ProgressProps) => {
  const { ref, width: w } = useMeasuredSize<HTMLDivElement>();
  const barHeight = byDensity(density, [8, 12, 16]);
  const accent = resolveColor(color, INK);
  const clamped = Math.min(100, Math.max(0, value));
  const inner = Math.max(0, w - 4);

  return (
    <div id={id} className={cn("flex flex-col gap-1", className)} style={{ ...sizeStyle(width), ...style }}>
      <SketchFrame
        seed={id ?? "progress"}
        corner="pill"
        stroke={INK_FAINT}
        strokeWidth={1.1}
        className="w-full"
        contentClassName="block"
        style={{ height: barHeight }}
      >
        <span ref={ref} className="relative block h-full w-full">
          {inner > 0 && (
            <svg
              aria-hidden="true"
              className={cn(
                "absolute inset-0 h-full w-full",
                indeterminate && "animate-[tendril-pulse_1.4s_ease-in-out_infinite]",
              )}
            >
              <RoughShape
                shape={{
                  kind: "rectangle",
                  x: 2,
                  y: 2,
                  width: Math.max(2, (inner * (indeterminate ? 45 : clamped)) / 100),
                  height: Math.max(2, barHeight - 6),
                }}
                seed={`${id}-fill`}
                stroke={accent}
                strokeWidth={1}
                fill={accent}
                fillStyle="solid"
              />
            </svg>
          )}
        </span>
      </SketchFrame>
      {(goal || !indeterminate) && (
        <span
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex justify-between text-xs text-ink-muted"
        >
          <span>{goal}</span>
          {!indeterminate && <span>{Math.round(clamped)}%</span>}
        </span>
      )}
    </div>
  );
};

export interface ProgressSegment {
  value: number;
  color?: string;
  label?: string;
}

export interface StackedProgressProps extends WidgetBaseProps {
  segments?: ProgressSegment[];
  barHeight?: number;
  showLabels?: boolean;
  rounded?: boolean;
  /** Index of the segment to emphasise. */
  selected?: number;
  width?: Sizing;
  density?: Densities;
  onSelect?: (index: number, segment: ProgressSegment) => void;
}

/** Several proportional segments in one bar. Mirrors `Ivy.StackedProgress`. */
export const StackedProgress = ({
  id,
  segments = [],
  barHeight,
  showLabels = true,
  rounded = true,
  selected,
  width = "100%",
  density = "Medium",
  className,
  style,
  onSelect,
}: StackedProgressProps) => {
  const { ref, width: w } = useMeasuredSize<HTMLDivElement>();
  const height = barHeight ?? byDensity(density, [10, 14, 18]);
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0) || 1;
  const inner = Math.max(0, w - 4);

  let offset = 2;

  return (
    <div id={id} className={cn("flex flex-col gap-2", className)} style={{ ...sizeStyle(width), ...style }}>
      <SketchFrame
        seed={id ?? "stacked"}
        corner={rounded ? "pill" : "sharp"}
        stroke={INK_FAINT}
        strokeWidth={1.1}
        className="w-full"
        contentClassName="block"
        style={{ height }}
      >
        <span ref={ref} className="relative block h-full w-full">
          {inner > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
              {segments.map((segment, index) => {
                const segmentWidth = (inner * Math.max(0, segment.value)) / total;
                const x = offset;
                offset += segmentWidth;
                if (segmentWidth <= 0) return null;
                return (
                  <RoughShape
                    key={index}
                    shape={{
                      kind: "rectangle",
                      x,
                      y: 2,
                      width: segmentWidth,
                      height: Math.max(2, height - 6),
                    }}
                    seed={`${id}-seg-${index}`}
                    stroke={resolveColor(segment.color, seriesColor("Default", index))}
                    strokeWidth={1}
                    fill={resolveColor(segment.color, seriesColor("Default", index))}
                    fillStyle="solid"
                    className={onSelect ? "cursor-pointer" : undefined}
                    onClick={onSelect ? () => onSelect(index, segment) : undefined}
                  />
                );
              })}
            </svg>
          )}
        </span>
      </SketchFrame>
      {showLabels && (
        <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          {segments.map((segment, index) => (
            <span
              key={index}
              className={cn("flex items-center gap-1.5", selected === index && "font-bold text-ink")}
            >
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rotate-3"
                style={{ background: resolveColor(segment.color, seriesColor("Default", index)) }}
              />
              {segment.label ?? `Segment ${index + 1}`}
              <span className="text-ink-faint">{Math.round((segment.value / total) * 100)}%</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
};
