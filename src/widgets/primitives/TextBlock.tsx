import * as React from "react";
import { cn, densityText, overflowClass, textAlignClass, widgetStyle } from "@/lib/utils";
import type { Overflow, TextAlignment, WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";

export type TextBlockVariant =
  | "Literal"
  | "H1"
  | "H2"
  | "H3"
  | "H4"
  | "H5"
  | "H6"
  | "P"
  | "Inline"
  | "Block"
  | "Blockquote"
  | "Monospaced"
  | "Lead"
  | "Muted"
  | "Danger"
  | "Warning"
  | "Success"
  | "Label"
  | "Strong"
  | "Display";

export interface TextBlockProps extends WidgetBaseProps {
  content?: string;
  variant?: TextBlockVariant;
  strikeThrough?: boolean;
  color?: string;
  noWrap?: boolean;
  overflow?: Overflow;
  bold?: boolean;
  italic?: boolean;
  muted?: boolean;
  textAlignment?: TextAlignment;
  anchor?: string;
  children?: React.ReactNode;
}

const VARIANT_TAG: Record<TextBlockVariant, React.ElementType> = {
  Literal: "pre",
  H1: "h1",
  H2: "h2",
  H3: "h3",
  H4: "h4",
  H5: "h5",
  H6: "h6",
  P: "p",
  Inline: "span",
  Block: "div",
  Blockquote: "blockquote",
  Monospaced: "code",
  Lead: "p",
  Muted: "p",
  Danger: "p",
  Warning: "p",
  Success: "p",
  Label: "label",
  Strong: "strong",
  Display: "h1",
};

const VARIANT_CLASS: Record<TextBlockVariant, string> = {
  Literal: "font-sketch-mono whitespace-pre-wrap text-sm",
  H1: "text-3xl font-bold tracking-tight",
  H2: "text-2xl font-bold tracking-tight",
  H3: "text-xl font-bold",
  H4: "text-lg font-bold",
  H5: "text-base font-bold",
  H6: "text-sm font-bold uppercase tracking-wide",
  P: "leading-relaxed",
  Inline: "",
  Block: "leading-relaxed",
  Blockquote: "border-l-2 border-dashed border-ink-faint pl-4 italic text-ink-muted",
  Monospaced: "font-sketch-mono bg-paper-sunken px-1.5 py-0.5 text-[0.9em]",
  Lead: "text-lg text-ink-muted leading-relaxed",
  Muted: "text-ink-muted",
  Danger: "text-destructive",
  Warning: "text-warning",
  Success: "text-success",
  Label: "text-sm font-bold",
  Strong: "font-bold",
  Display: "text-5xl font-bold tracking-tight -rotate-[0.4deg]",
};

/**
 * Every piece of static text in the wireframe. Mirrors `Ivy.TextBlock`.
 *
 * @tags text heading paragraph copy
 * @example <TextBlock variant="H2" content="Section title" />
 */
export const TextBlock = ({
  id,
  content,
  variant = "Block",
  width,
  height,
  aspectRatio,
  visible,
  strikeThrough,
  color,
  noWrap,
  overflow,
  bold,
  italic,
  muted,
  density = "Medium",
  textAlignment,
  anchor,
  className,
  style,
  children,
  ...rest
}: TextBlockProps) => {
  const Tag = VARIANT_TAG[variant];
  const isHeading = /^H[1-6]$|^Display$/.test(variant);

  return (
    <Tag
      id={anchor ?? id}
      className={cn(
        VARIANT_CLASS[variant],
        !isHeading && variant !== "Literal" && densityText(density),
        textAlignClass(textAlignment),
        overflowClass(overflow),
        noWrap && "whitespace-nowrap",
        strikeThrough && "line-through decoration-2",
        bold && "font-bold",
        italic && "italic",
        muted && "text-ink-muted",
        className,
      )}
      style={{
        color: color ? resolveColor(color) : undefined,
        ...widgetStyle({ width, height, aspectRatio, visible, style }),
      }}
      {...rest}
    >
      {children ?? content}
    </Tag>
  );
};
