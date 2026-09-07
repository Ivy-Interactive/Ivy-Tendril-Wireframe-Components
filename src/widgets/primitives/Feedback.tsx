import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, INK_MUTED, STROKE, resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export interface ErrorProps extends WidgetBaseProps {
  title?: string | null;
  message?: string | null;
  stackTrace?: string | null;
}

/** The red-pencil error panel. Mirrors `Ivy.Error`. */
export const ErrorPanel = ({
  id,
  title,
  message,
  stackTrace,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: ErrorProps) => (
  <SketchFrame
    id={id}
    seed={id ?? "error"}
    stroke={resolveColor("Destructive")}
    fill={tint(resolveColor("Destructive"), 0.9)}
    fillStyle="solid"
    className={cn("inline-block max-w-full", className)}
    contentClassName="flex items-start gap-3 p-4"
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <Icon name="OctagonAlert" color="Destructive" size={20} className="mt-0.5" />
    <span className="block min-w-0 flex-1">
      <span className="block font-bold text-destructive">{title ?? "Something went wrong"}</span>
      {message && <span className="mt-1 block text-sm">{message}</span>}
      {stackTrace && (
        <pre className="mt-2 max-h-56 overflow-auto rounded-none bg-paper-sunken p-2 font-sketch-mono text-xs whitespace-pre-wrap text-ink-muted">
          {stackTrace}
        </pre>
      )}
    </span>
  </SketchFrame>
);

export interface EmptyProps extends WidgetBaseProps {
  title?: string;
  description?: string;
  icon?: string;
  children?: React.ReactNode;
}

/** Placeholder for "there is nothing here yet". Mirrors `Ivy.Empty`. */
export const Empty = ({
  id,
  title = "Nothing here",
  description,
  icon = "Inbox",
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: EmptyProps) => (
  <div
    id={id}
    className={cn("flex flex-col items-center justify-center gap-2 p-8 text-center", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <Icon name={icon} size={36} color={INK_FAINT} />
    <span className="font-bold text-ink-muted">{title}</span>
    {description && <span className="max-w-xs text-sm text-ink-faint">{description}</span>}
    {children}
  </div>
);

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

export type SpacerProps = WidgetBaseProps;

/** Blank space. Mirrors `Ivy.Spacer`. */
export const Spacer = ({ id, width, height, aspectRatio, visible, className, style }: SpacerProps) => (
  <div
    id={id}
    aria-hidden="true"
    className={cn(!width && !height && "flex-1", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  />
);
