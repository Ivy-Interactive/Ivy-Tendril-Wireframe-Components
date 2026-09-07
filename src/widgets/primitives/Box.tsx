import * as React from "react";
import { alignStyle, cn, sizeStyle, toCssSize } from "@/lib/utils";
import type { Align, BorderRadius, BorderStyle, HoverEffect, Sizing, WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";
import { SketchFrame, type SketchCorner, type SketchOutline } from "@/sketch/SketchFrame";

export const HOVER_CLASS: Record<HoverEffect, string> = {
  None: "",
  Pointer: "cursor-pointer",
  PointerAndTranslate: "cursor-pointer transition-transform hover:-translate-y-0.5",
  Shadow: "transition-shadow hover:shadow-[3px_3px_0_0_var(--color-ink-faint)]",
};

export const cornerFor = (radius?: BorderRadius): SketchCorner =>
  radius === "Full" ? "pill" : radius === "None" ? "sharp" : "rounded";

export const outlineFor = (style?: BorderStyle): SketchOutline =>
  style === "None" ? "none" : style === "Dashed" ? "dashed" : style === "Dotted" ? "dotted" : "solid";

export interface BoxProps extends WidgetBaseProps {
  children?: React.ReactNode;
  background?: string;
  borderRadius?: BorderRadius;
  borderThickness?: Sizing;
  borderStyle?: BorderStyle;
  borderColor?: string;
  padding?: Sizing;
  margin?: Sizing;
  width?: Sizing;
  height?: Sizing;
  contentAlign?: Align;
  opacity?: number;
  borderOpacity?: number;
  aspectRatio?: number;
  hoverVariant?: HoverEffect;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/** A sketched container with a border, fill and alignment. Mirrors `Ivy.Box`. */
export const Box = ({
  id,
  children,
  background,
  borderRadius = "Rounded",
  borderThickness = "1",
  borderStyle = "Solid",
  borderColor,
  padding,
  margin,
  width,
  height,
  contentAlign = "Center",
  opacity,
  borderOpacity,
  aspectRatio,
  hoverVariant = "None",
  className,
  style,
  onClick,
  ...rest
}: BoxProps) => {
  const thickness = Number(String(borderThickness).replace(/[^\d.]/g, "")) || 1;

  return (
    <SketchFrame
      id={id}
      seed={id ?? "box"}
      corner={cornerFor(borderRadius)}
      outline={outlineFor(borderStyle)}
      stroke={resolveColor(borderColor)}
      strokeWidth={thickness * 1.4}
      fill={background ? resolveColor(background) : undefined}
      fillStyle="solid"
      opacity={borderOpacity}
      onClick={onClick}
      className={cn(HOVER_CLASS[hoverVariant], onClick && "cursor-pointer", className)}
      contentClassName="h-full w-full"
      style={{
        opacity,
        aspectRatio,
        padding: toCssSize(padding),
        margin: toCssSize(margin),
        ...sizeStyle(width, height),
        ...style,
      }}
      {...rest}
    >
      <span style={{ ...alignStyle("Vertical", contentAlign), height: "100%", width: "100%" }}>
        {children}
      </span>
    </SketchFrame>
  );
};
