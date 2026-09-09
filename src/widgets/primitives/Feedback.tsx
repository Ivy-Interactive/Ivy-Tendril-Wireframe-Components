import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, INK_MUTED, STROKE } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export interface SkeletonProps extends WidgetBaseProps {
  /** Number of stacked placeholder lines. */
  lines?: number;
}

/** A scribbled placeholder block. Mirrors `Ivy.Skeleton`. */
export const Skeleton = ({
  id,
  width = "100%",
  height = "1.25rem",
  aspectRatio,
  visible,
  lines = 1,
  className,
  style,
}: SkeletonProps) => {
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const rowHeight = lines > 1 ? h / lines : h;

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative animate-[tendril-pulse_1.8s_ease-in-out_infinite]", className)}
      style={widgetStyle({
        width,
        height: lines > 1 ? `calc(${height} * ${lines})` : height,
        aspectRatio,
        visible,
        style,
      })}
    >
      {w > 0 && h > 0 && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          {Array.from({ length: lines }).map((_, index) => {
            const top = index * rowHeight + rowHeight * 0.2;
            const lineWidth = index === lines - 1 && lines > 1 ? w * 0.6 : w;
            return (
              <RoughShape
                key={index}
                seed={`${id}-skeleton-${index}`}
                shape={{
                  kind: "rectangle",
                  x: 1,
                  y: top,
                  width: Math.max(1, lineWidth - 2),
                  height: Math.max(1, rowHeight * 0.6),
                }}
                stroke={INK_FAINT}
                strokeWidth={STROKE.thin}
                fill={INK_FAINT}
                fillStyle="hachure"
                fillWeight={0.6}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

export interface LoadingProps extends WidgetBaseProps {
  type?: "Spinner" | "Skeleton";
  label?: string;
}

/** Spinner or skeleton placeholder. Mirrors `Ivy.Loading`. */
export const Loading = ({
  id,
  type = "Spinner",
  label,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: LoadingProps) => {
  const rootStyle = widgetStyle({ width, height, aspectRatio, visible, style });

  if (type === "Skeleton") {
    return <Skeleton id={id} lines={3} className={className} style={rootStyle} />;
  }

  return (
    <div id={id} className={cn("flex items-center gap-2 text-ink-muted", className)} style={rootStyle}>
      <svg width="20" height="20" viewBox="0 0 20 20" className="animate-spin" aria-hidden="true">
        <RoughShape
          shape={{ kind: "arc", x: 10, y: 10, width: 15, height: 15, start: 0.5, stop: 5.4 }}
          seed="loading-arc"
          stroke={INK_MUTED}
          strokeWidth={STROKE.heavy}
          roughness={1.6}
        />
      </svg>
      {label && <span className="text-sm">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
};
