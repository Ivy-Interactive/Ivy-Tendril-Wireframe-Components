import * as React from "react";
import { cn, densityText, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

export type CalloutVariant = "Info" | "Success" | "Warning" | "Error" | "Destructive";

const VARIANT: Record<CalloutVariant, { color: string; icon: string }> = {
  Info: { color: "Info", icon: "Info" },
  Success: { color: "Success", icon: "CircleCheck" },
  Warning: { color: "Warning", icon: "TriangleAlert" },
  Error: { color: "Destructive", icon: "CircleAlert" },
  Destructive: { color: "Destructive", icon: "CircleAlert" },
};

export interface CalloutProps extends WidgetBaseProps {
  title?: string;
  children?: React.ReactNode;
  variant?: CalloutVariant;
  icon?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * A boxed aside with an icon, in one of five tones. Mirrors `Ivy.Callout`.
 *
 * @tags alert notice banner
 * @example <Callout variant="Warning" title="Careful">This cannot be undone.</Callout>
 */
export const Callout = ({
  id,
  title,
  children,
  variant = "Info",
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  icon,
  className,
  style,
  onClick,
  ...rest
}: CalloutProps) => {
  const tone = VARIANT[variant];
  const color = resolveColor(tone.color);

  return (
    <SketchFrame
      id={id}
      seed={id ?? `callout-${variant}`}
      corner="rounded"
      stroke={color}
      fill={tint(color, 0.9)}
      fillStyle="solid"
      onClick={onClick}
      className={cn("inline-block", onClick && "cursor-pointer", className)}
      contentClassName={cn("flex items-start gap-3 p-3", densityText(density))}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      {...rest}
    >
      <Icon name={icon ?? tone.icon} color={tone.color} size={density === "Small" ? 14 : 18} className="mt-0.5" />
      <span className="block min-w-0 flex-1">
        {title && <span className="mb-0.5 block font-bold">{title}</span>}
        <span className="block text-ink">{children}</span>
      </span>
    </SketchFrame>
  );
};
