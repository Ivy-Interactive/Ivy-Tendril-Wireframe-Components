import * as React from "react";
import { byDensity, cn, densityIconSize, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK, STROKE, resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

export type BadgeVariant =
  | "Primary"
  | "Destructive"
  | "Outline"
  | "Secondary"
  | "Success"
  | "Warning"
  | "Info";

const VARIANT_COLOR: Record<BadgeVariant, string> = {
  Primary: "Primary",
  Destructive: "Destructive",
  Outline: "Primary",
  Secondary: "Secondary",
  Success: "Success",
  Warning: "Warning",
  Info: "Info",
};

export interface BadgeProps extends WidgetBaseProps {
  title?: string;
  icon?: string;
  iconPosition?: "Left" | "Right";
  variant?: BadgeVariant;
  color?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * A small status pill. Mirrors `Ivy.Badge`.
 *
 * @tags status label chip pill
 * @example <Badge title="Active" variant="Success" />
 */
export const Badge = ({
  id,
  title,
  icon,
  iconPosition = "Left",
  variant = "Primary",
  color,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  children,
  className,
  style,
  onClick,
  ...rest
}: BadgeProps) => {
  const accent = resolveColor(color ?? VARIANT_COLOR[variant], INK);
  const filled = variant !== "Outline";
  const iconNode = icon ? (
    <Icon name={icon} size={densityIconSize(density) - 2} color={accent} />
  ) : null;

  return (
    <SketchFrame
      id={id}
      as={onClick ? "button" : "span"}
      type={onClick ? "button" : undefined}
      seed={id ?? `${variant}-${title ?? "badge"}`}
      corner="pill"
      stroke={accent}
      strokeWidth={STROKE.thin}
      fill={filled ? tint(accent, 0.85) : undefined}
      fillStyle="solid"
      onClick={onClick}
      className={cn("inline-block align-middle", onClick && "cursor-pointer", className)}
      contentClassName={cn(
        "flex items-center gap-1 leading-none whitespace-nowrap",
        byDensity(density, ["px-2 py-0.5 text-[10px]", "px-2.5 py-1 text-xs", "px-3 py-1.5 text-sm"]),
      )}
      style={{ color: accent, ...widgetStyle({ width, height, aspectRatio, visible, style }) }}
      {...rest}
    >
      {iconPosition === "Left" && iconNode}
      <span>{children ?? title}</span>
      {iconPosition === "Right" && iconNode}
    </SketchFrame>
  );
};
