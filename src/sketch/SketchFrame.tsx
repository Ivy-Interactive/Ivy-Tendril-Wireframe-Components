import * as React from "react";
import { cn, seedFrom } from "@/lib/utils";
import { INK } from "./colors";
import { useSketchTheme } from "./SketchProvider";
import {
  roughPaths,
  useMeasuredSize,
  useRoughPaths,
  type RoughOptions,
  type SketchShape,
} from "./useRough";

export type SketchFillStyle =
  | "hachure"
  | "solid"
  | "zigzag"
  | "cross-hatch"
  | "dots"
  | "dashed"
  | "zigzag-line";

export type SketchOutline = "solid" | "dashed" | "dotted" | "none";

export type SketchCorner = "sharp" | "rounded" | "pill" | "ellipse";

export interface SketchLayerProps {
  corner?: SketchCorner;
  outline?: SketchOutline;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: SketchFillStyle;
  fillWeight?: number;
  hachureAngle?: number;
  roughness?: number;
  bowing?: number;
  /** Stable seed so a widget redraws with the same wobble on every render. */
  seed?: string | number;
  /** Draw only some of the four edges — for table cells, headers, dividers. */
  sides?: Array<"top" | "right" | "bottom" | "left">;
  /** Trace the border twice, the way a marker doubles back over a box. */
  doubleStroke?: boolean;
  opacity?: number;
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (radius === 0) return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
  return [
    `M ${x + radius} ${y}`,
    `H ${x + w - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`,
    `V ${y + h - radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`,
    `H ${x + radius}`,
    `A ${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`,
    `V ${y + radius}`,
    `A ${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
    "Z",
  ].join(" ");
}

function edgeShape(
  side: "top" | "right" | "bottom" | "left",
  x: number,
  y: number,
  w: number,
  h: number,
): SketchShape {
  switch (side) {
    case "top":
      return { kind: "line", x1: x, y1: y, x2: x + w, y2: y };
    case "right":
      return { kind: "line", x1: x + w, y1: y, x2: x + w, y2: y + h };
    case "bottom":
      return { kind: "line", x1: x, y1: y + h, x2: x + w, y2: y + h };
    case "left":
      return { kind: "line", x1: x, y1: y, x2: x, y2: y + h };
  }
}

export interface SketchLayerRenderProps extends SketchLayerProps {
  width: number;
  height: number;
  className?: string;
}

/**
 * The pencil layer: absolutely positioned, behind content, never clickable.
 *
 * @internal
 */
export const SketchLayer = ({
  width,
  height,
  corner = "rounded",
  outline = "solid",
  stroke = INK,
  strokeWidth,
  fill,
  fillStyle = "solid",
  fillWeight,
  hachureAngle,
  roughness,
  bowing,
  seed,
  sides,
  doubleStroke,
  opacity,
  className,
}: SketchLayerRenderProps) => {
  const theme = useSketchTheme();
  const sw = strokeWidth ?? theme.strokeWidth;
  const inset = sw + 1;
  const w = Math.max(0, width - inset * 2);
  const h = Math.max(0, height - inset * 2);

  const options = React.useMemo<RoughOptions>(
    () => ({
      stroke: outline === "none" ? "none" : stroke,
      strokeWidth: sw,
      roughness: roughness ?? theme.roughness,
      bowing: bowing ?? theme.bowing,
      fill,
      fillStyle,
      fillWeight: fillWeight ?? sw / 2,
      hachureAngle: hachureAngle ?? -41,
      seed: theme.deterministic ? seedFrom(seed) : undefined,
      disableMultiStroke: !doubleStroke,
      preserveVertices: true,
      ...(outline === "dashed" ? { strokeLineDash: [7, 4] } : {}),
      ...(outline === "dotted" ? { strokeLineDash: [1, 4] } : {}),
    }),
    [
      outline,
      stroke,
      sw,
      roughness,
      bowing,
      fill,
      fillStyle,
      fillWeight,
      hachureAngle,
      seed,
      doubleStroke,
      theme.roughness,
      theme.bowing,
      theme.deterministic,
    ],
  );

  const shape = React.useMemo<SketchShape | null>(() => {
    if (w <= 0 || h <= 0 || sides?.length) return null;
    if (corner === "ellipse") {
      return { kind: "ellipse", cx: inset + w / 2, cy: inset + h / 2, width: w, height: h };
    }
    const radius = corner === "pill" ? h / 2 : corner === "rounded" ? 6 : 0;
    if (radius === 0) return { kind: "rectangle", x: inset, y: inset, width: w, height: h };
    return { kind: "path", d: roundedRectPath(inset, inset, w, h, radius) };
  }, [corner, inset, w, h, sides]);

  const boxPaths = useRoughPaths(shape, options);

  const edgePaths = React.useMemo(() => {
    if (!sides?.length || w <= 0 || h <= 0) return [];
    return sides.flatMap((side) =>
      roughPaths(edgeShape(side, inset, inset, w, h), {
        ...options,
        seed: theme.deterministic ? seedFrom(`${seed}-${side}`) : undefined,
      }),
    );
  }, [sides, inset, w, h, options, seed, theme.deterministic]);

  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible",
        className,
      )}
      style={{ opacity }}
    >
      {[...boxPaths, ...edgePaths].map((path, index) => (
        <path
          key={index}
          d={path.d}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fill={path.fill ?? "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
};

export interface SketchFrameProps
  extends SketchLayerProps,
    Omit<React.AllHTMLAttributes<HTMLElement>, "color" | "children" | "width" | "height" | "size" | "as"> {
  as?: React.ElementType;
  /** Element used for the content layer. Defaults to a `<span>`. */
  contentAs?: React.ElementType;
  contentClassName?: string;
  children?: React.ReactNode;
}

/**
 * A box whose border (and optional fill) is drawn with rough.js. Every other
 * widget in the library is built on top of this.
 */
export const SketchFrame = React.forwardRef<HTMLElement, SketchFrameProps>(function SketchFrame(
  {
    as: Component = "div",
    contentAs: Content = "span",
    children,
    className,
    contentClassName,
    corner,
    outline,
    stroke,
    strokeWidth,
    fill,
    fillStyle,
    fillWeight,
    hachureAngle,
    roughness,
    bowing,
    seed,
    sides,
    doubleStroke,
    opacity,
    ...rest
  },
  forwardedRef,
) {
  const { ref, width, height } = useMeasuredSize<HTMLElement>();

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      ref.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [forwardedRef, ref],
  );

  return (
    <Component ref={setRefs} className={cn("relative", className)} {...rest}>
      <SketchLayer
        width={width}
        height={height}
        corner={corner}
        outline={outline}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        fillStyle={fillStyle}
        fillWeight={fillWeight}
        hachureAngle={hachureAngle}
        roughness={roughness}
        bowing={bowing}
        seed={seed}
        sides={sides}
        doubleStroke={doubleStroke}
        opacity={opacity}
      />
      <Content className={cn("relative z-[1] block", contentClassName)}>{children}</Content>
    </Component>
  );
});
