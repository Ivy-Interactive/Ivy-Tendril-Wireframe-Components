import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, sizeStyle } from "@/lib/utils";
import type { BorderRadius, Densities, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, INK_MUTED, resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { cornerFor } from "./primitives/Box";

export type ButtonVariant =
  | "Primary"
  | "Secondary"
  | "Destructive"
  | "Outline"
  | "Ghost"
  | "Link"
  | "Inline"
  | "Ai";

export interface ButtonProps extends WidgetBaseProps {
  title?: string;
  icon?: string;
  iconPosition?: "Left" | "Right";
  density?: Densities;
  variant?: ButtonVariant;
  disabled?: boolean;
  tooltip?: string;
  foreground?: string;
  strikeThrough?: boolean;
  loading?: boolean;
  url?: string;
  target?: "Blank" | "Self";
  width?: Sizing;
  autoFocus?: boolean;
  /** Keyboard shortcut shown on the right, e.g. `"Ctrl+S"`. */
  shortcutKey?: string;
  badge?: string;
  borderRadius?: BorderRadius;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

interface VariantStyle {
  stroke: string;
  fill?: string;
  text: string;
  outline?: "solid" | "dashed" | "none";
  doubleStroke?: boolean;
}

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  Primary: { stroke: INK, fill: "#e8e5db", text: "text-ink", doubleStroke: true },
  Secondary: { stroke: INK_MUTED, fill: "#f4f2ec", text: "text-ink" },
  Destructive: {
    stroke: resolveColor("Destructive"),
    fill: tint(resolveColor("Destructive"), 0.86),
    text: "text-destructive",
  },
  Outline: { stroke: INK, text: "text-ink" },
  Ghost: { stroke: "none", text: "text-ink", outline: "none" },
  Link: { stroke: "none", text: "text-accent sketch-underline", outline: "none" },
  Inline: { stroke: "none", text: "text-ink sketch-underline", outline: "none" },
  Ai: {
    stroke: resolveColor("Violet"),
    fill: tint(resolveColor("Violet"), 0.88),
    text: "text-ink",
    outline: "dashed",
  },
};

/**
 * The workhorse control. Mirrors `Ivy.Button`, including its variant list,
 * icon placement, badge and shortcut hint.
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    id,
    title,
    icon,
    iconPosition = "Left",
    density = "Medium",
    variant = "Primary",
    disabled,
    tooltip,
    foreground,
    strikeThrough,
    loading,
    url,
    target = "Self",
    width,
    autoFocus,
    shortcutKey,
    badge,
    borderRadius = "Rounded",
    children,
    className,
    style,
    onClick,
    ...rest
  },
  ref,
) {
  const tone = VARIANTS[variant];
  const bare = variant === "Ghost" || variant === "Link" || variant === "Inline";
  const label = children ?? title;
  const iconNode = loading ? (
    <Icon name="LoaderCircle" size={densityIconSize(density)} className="animate-spin" />
  ) : icon ? (
    <Icon name={icon} size={densityIconSize(density)} />
  ) : null;

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (url) window.open(url, target === "Blank" ? "_blank" : "_self");
  };

  return (
    <SketchFrame
      ref={ref}
      as={url && !onClick ? "a" : "button"}
      id={id}
      seed={id ?? `${variant}-${title ?? "button"}`}
      corner={cornerFor(borderRadius)}
      outline={tone.outline ?? "solid"}
      stroke={tone.stroke === "none" ? "none" : tone.stroke}
      fill={bare ? undefined : tone.fill}
      fillStyle="solid"
      doubleStroke={tone.doubleStroke}
      href={url && !onClick ? url : undefined}
      target={url && target === "Blank" ? "_blank" : undefined}
      rel={url && target === "Blank" ? "noreferrer" : undefined}
      type={url && !onClick ? undefined : "button"}
      disabled={url && !onClick ? undefined : disabled || loading}
      autoFocus={autoFocus}
      title={tooltip}
      aria-label={typeof label === "string" ? label : undefined}
      onClick={handleClick}
      className={cn(
        "inline-block cursor-pointer text-left transition-transform select-none",
        !disabled && !bare && "active:translate-y-px",
        !disabled && bare && "hover:opacity-70",
        disabled && "cursor-not-allowed opacity-45",
        tone.text,
        densityText(density),
        className,
      )}
      contentClassName={cn(
        "flex items-center justify-center gap-2",
        bare ? "px-0.5 py-0.5" : byDensity(density, ["px-2.5 py-1", "px-3.5 py-1.5", "px-5 py-2.5"]),
      )}
      style={{ color: foreground ? resolveColor(foreground) : undefined, ...sizeStyle(width), ...style }}
      {...rest}
    >
      {iconPosition === "Left" && iconNode}
      {label && <span className={cn("leading-none", strikeThrough && "line-through")}>{label}</span>}
      {iconPosition === "Right" && iconNode}
      {badge && (
        <span
          className="ml-1 inline-flex min-w-4 items-center justify-center rounded-full border border-current px-1 text-[10px] leading-tight"
          aria-label={`${badge} pending`}
        >
          {badge}
        </span>
      )}
      {shortcutKey && (
        <span className="ml-2 font-sketch-mono text-[10px]" style={{ color: INK_FAINT }}>
          {shortcutKey}
        </span>
      )}
    </SketchFrame>
  );
});
