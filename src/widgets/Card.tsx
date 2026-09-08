import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { HoverEffect, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED } from "@/sketch/colors";
import { SketchFrame } from "@/sketch/SketchFrame";
import { HOVER_CLASS } from "./primitives/Box";

export interface CardProps extends WidgetBaseProps {
  title?: string;
  description?: string;
  /** Rendered above the title area; use for toolbars, badges, avatars. */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  hoverVariant?: HoverEffect;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * A sheet of paper with an optional header and footer. Mirrors `Ivy.Card`,
 * whose `Header` / `Content` / `Footer` slots become props here.
 *
 * @tags container panel surface
 * @slot header Rendered above the title
 * @slot footer Rendered below a dashed rule
 * @example <Card title="Revenue" description="Last 30 days">£24,500</Card>
 */
export const Card = ({
  id,
  title,
  description,
  header,
  footer,
  children,
  width,
  height,
  aspectRatio,
  visible,
  hoverVariant = "None",
  density = "Medium",
  disabled,
  className,
  style,
  onClick,
  ...rest
}: CardProps) => {
  const pad = byDensity(density, ["p-2.5", "p-4", "p-6"]);

  return (
    <SketchFrame
      id={id}
      seed={id ?? title ?? "card"}
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      onClick={disabled ? undefined : onClick}
      className={cn(
        "inline-block text-left",
        HOVER_CLASS[hoverVariant],
        onClick && !disabled && "cursor-pointer",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      contentClassName="flex h-full flex-col"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      {...rest}
    >
      {(header || title || description) && (
        <span className={cn("block", pad, (children || footer) && "pb-0")}>
          {header}
          {title && <span className="block text-base font-bold">{title}</span>}
          {description && <span className="mt-0.5 block text-sm text-ink-muted">{description}</span>}
        </span>
      )}
      {children != null && <span className={cn("block flex-1", pad)}>{children}</span>}
      {footer && (
        <span className={cn("mt-auto block border-t border-dashed border-ink-faint", pad)}>
          {footer}
        </span>
      )}
    </SketchFrame>
  );
};
