import * as React from "react";
import { byDensity, cn, densityIconSize, sizeStyle } from "@/lib/utils";
import type { Densities, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, INK_MUTED, resolveColor, tint } from "@/sketch/colors";
import { Icon as SketchIcon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export interface IconProps extends WidgetBaseProps {
  name: string;
  color?: string;
  width?: Sizing;
  height?: Sizing;
  density?: Densities;
}

/** A single lucide glyph sized by density. Mirrors `Ivy.Icon`. */
export const Icon = ({ id, name, color, width, height, density, className, style }: IconProps) => (
  <span
    id={id}
    className={cn("inline-flex items-center justify-center", className)}
    style={{ ...sizeStyle(width, height), ...style }}
  >
    <SketchIcon name={name} color={color} size={densityIconSize(density) + 4} />
  </span>
);

export interface AvatarProps extends WidgetBaseProps {
  image?: string;
  fallback?: string;
  color?: string;
  density?: Densities;
  width?: Sizing;
  height?: Sizing;
}

/** A circled portrait or set of initials. Mirrors `Ivy.Avatar`. */
export const Avatar = ({
  id,
  image,
  fallback = "?",
  color,
  density = "Medium",
  width,
  height,
  className,
  style,
}: AvatarProps) => {
  const size = byDensity(density, [28, 36, 48]);
  const accent = resolveColor(color, INK_MUTED);

  return (
    <SketchFrame
      id={id}
      seed={id ?? fallback}
      corner="ellipse"
      stroke={accent}
      fill={image ? undefined : tint(accent, 0.85)}
      fillStyle="solid"
      className={cn("inline-block shrink-0 overflow-hidden", className)}
      contentClassName="flex h-full w-full items-center justify-center"
      style={{ ...sizeStyle(width ?? `${size}px`, height ?? `${size}px`), ...style }}
    >
      {image ? (
        <img
          src={image}
          alt={fallback}
          className="h-full w-full rounded-full object-cover [filter:url(#tendril-wobble)_grayscale(0.3)]"
        />
      ) : (
        <span className="text-xs font-bold" style={{ color: accent }}>
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      )}
    </SketchFrame>
  );
};

export interface KbdProps extends WidgetBaseProps {
  content?: string;
  ghost?: boolean;
  density?: Densities;
  children?: React.ReactNode;
}

/** A key cap. Mirrors `Ivy.Kbd`. */
export const Kbd = ({ id, content, ghost, density, children, className, style }: KbdProps) => (
  <SketchFrame
    id={id}
    as="kbd"
    seed={id ?? content ?? "kbd"}
    corner="rounded"
    outline={ghost ? "none" : "solid"}
    stroke={INK_MUTED}
    fill={ghost ? undefined : "#f2f0e9"}
    fillStyle="solid"
    strokeWidth={1}
    className={cn("inline-block align-middle", className)}
    contentClassName={cn(
      "px-1.5 py-0.5 font-sketch-mono leading-none",
      byDensity(density, ["text-[10px]", "text-xs", "text-sm"]),
    )}
    style={style}
  >
    {children ?? content}
  </SketchFrame>
);

export interface StepperItem {
  symbol?: string;
  icon?: string;
  label?: string;
  description?: string;
  loading?: boolean;
}

export interface StepperProps extends WidgetBaseProps {
  items?: StepperItem[];
  selectedIndex?: number;
  width?: Sizing;
  allowSelectForward?: boolean;
  disabled?: boolean;
  density?: Densities;
  onSelect?: (index: number) => void;
}

/** Numbered progress through a flow. Mirrors `Ivy.Stepper`. */
export const Stepper = ({
  id,
  items = [],
  selectedIndex = 0,
  width,
  allowSelectForward = false,
  disabled,
  density = "Medium",
  className,
  style,
  onSelect,
}: StepperProps) => {
  const bubble = byDensity(density, [24, 30, 38]);

  return (
    <ol
      id={id}
      className={cn("flex list-none items-start gap-0 p-0", className)}
      style={{ ...sizeStyle(width), ...style }}
    >
      {items.map((item, index) => {
        const done = index < selectedIndex;
        const active = index === selectedIndex;
        const selectable = !disabled && (done || allowSelectForward || active);
        const color = done || active ? resolveColor("Primary") : INK_FAINT;

        return (
          <li key={index} className="flex min-w-0 flex-1 items-start last:flex-none">
            <div className="flex min-w-0 flex-col items-center gap-1">
              <SketchFrame
                as={selectable ? "button" : "div"}
                seed={`${id}-step-${index}`}
                corner="ellipse"
                stroke={color}
                fill={done ? tint(color, 0.8) : undefined}
                fillStyle="solid"
                onClick={selectable ? () => onSelect?.(index) : undefined}
                className={cn(
                  "shrink-0",
                  selectable && "cursor-pointer",
                  disabled && "cursor-not-allowed opacity-50",
                )}
                contentClassName="flex h-full w-full items-center justify-center"
                style={{ width: bubble, height: bubble }}
                aria-current={active ? "step" : undefined}
              >
                {item.loading ? (
                  <SketchIcon name="LoaderCircle" size={14} className="animate-spin" color={color} />
                ) : done ? (
                  <SketchIcon name="Check" size={14} color={color} />
                ) : item.icon ? (
                  <SketchIcon name={item.icon} size={14} color={color} />
                ) : (
                  <span className="text-xs font-bold" style={{ color }}>
                    {item.symbol ?? index + 1}
                  </span>
                )}
              </SketchFrame>
              {item.label && (
                <span
                  className={cn("max-w-28 text-center text-xs", active ? "font-bold" : "text-ink-muted")}
                >
                  {item.label}
                </span>
              )}
              {item.description && (
                <span className="max-w-28 text-center text-[10px] text-ink-faint">
                  {item.description}
                </span>
              )}
            </div>
            {index < items.length - 1 && (
              <StepperConnector done={index < selectedIndex} offset={bubble / 2} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

const StepperConnector = ({ done, offset }: { done: boolean; offset: number }) => {
  const { ref, width } = useMeasuredSize<HTMLDivElement>();
  return (
    <div ref={ref} className="relative mx-1 h-[3px] min-w-6 flex-1" style={{ marginTop: offset }}>
      {width > 0 && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          <RoughShape
            shape={{ kind: "line", x1: 0, y1: 1, x2: width, y2: 1 }}
            seed={`connector-${width}`}
            stroke={done ? resolveColor("Primary") : INK_FAINT}
            strokeWidth={1.3}
          />
        </svg>
      )}
    </div>
  );
};
