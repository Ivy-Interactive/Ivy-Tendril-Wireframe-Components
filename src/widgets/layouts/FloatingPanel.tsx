import * as React from "react";
import { cn, thicknessStyle, widgetStyle } from "@/lib/utils";
import type { Align, Sizing, Thickness, WidgetBaseProps } from "@/lib/types";

/** Where the panel parks itself, and how it is pulled back onto the anchor. */
const POSITION: Record<Align, string> = {
  TopLeft: "top-4 left-4",
  TopCenter: "top-4 left-1/2 -translate-x-1/2",
  TopRight: "top-4 right-4",
  BottomLeft: "bottom-4 left-4",
  BottomCenter: "bottom-4 left-1/2 -translate-x-1/2",
  BottomRight: "bottom-4 right-4",
  Left: "top-1/2 left-4 -translate-y-1/2",
  Right: "top-1/2 right-4 -translate-y-1/2",
  Center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  Stretch: "inset-4",
  SpaceBetween: "",
  SpaceAround: "",
  SpaceEvenly: "",
};

export interface FloatingPanelProps extends WidgetBaseProps {
  /** Which corner or edge the panel sits against. */
  alignSelf?: Align;
  /** Nudges the panel off that anchor, per edge. */
  offset?: Sizing | Thickness;
  /**
   * Floats within the nearest positioned ancestor instead of the viewport.
   * Give that ancestor `relative` for it to have anything to hold on to.
   */
  contained?: boolean;
  children?: React.ReactNode;
}

/**
 * A panel floating above everything else — a tool palette, a floating action
 * button, a status pill. Mirrors `Ivy.FloatingPanel`.
 *
 * @category Layouts
 * @ivy Ivy.FloatingPanel
 * @tags overlay palette fab sticky
 * @slot children The single child the panel floats
 * @example <FloatingPanel><Button title="New" icon="Plus" /></FloatingPanel>
 * @example <FloatingPanel alignSelf="TopCenter" offset={{ top: 8 }}>Saving…</FloatingPanel>
 */
export const FloatingPanel = ({
  id,
  alignSelf = "BottomRight",
  offset,
  contained,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: FloatingPanelProps) => (
  <div
    id={id}
    className={cn(contained ? "absolute" : "fixed", "z-50", POSITION[alignSelf], className)}
    style={{
      ...thicknessStyle(offset, "margin"),
      ...widgetStyle({ width, height, aspectRatio, visible, style }),
    }}
  >
    {children}
  </div>
);
