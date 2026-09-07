import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Align, Densities, Orientation, Overflow, Sizing, TextAlignment } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ivy sizes arrive as raw CSS lengths ("200px", "50%"), fractions ("1/2") or
 * bare numbers, which mean rem units on the Ivy side.
 */
export function toCssSize(size?: Sizing): string | undefined {
  if (size === undefined || size === null || size === "") return undefined;
  if (typeof size === "number") return `${size / 4}rem`;
  const fraction = /^(\d+)\/(\d+)$/.exec(size);
  if (fraction) return `${(Number(fraction[1]) / Number(fraction[2])) * 100}%`;
  if (/^\d+(\.\d+)?$/.test(size)) return `${Number(size) / 4}rem`;
  return size;
}

export function sizeStyle(width?: Sizing, height?: Sizing): React.CSSProperties {
  const style: React.CSSProperties = {};
  const w = toCssSize(width);
  const h = toCssSize(height);
  if (w) style.width = w;
  if (h) style.height = h;
  return style;
}

const DENSITY_ORDER: Densities[] = ["Small", "Medium", "Large"];

/** Picks one of three values by density; falls back to `Medium`. */
export function byDensity<T>(density: Densities | undefined, values: [T, T, T]): T {
  const index = DENSITY_ORDER.indexOf(density ?? "Medium");
  return values[index === -1 ? 1 : index];
}

export const densityText = (density?: Densities) =>
  byDensity(density, ["text-xs", "text-sm", "text-base"]);

export const densityPadding = (density?: Densities) =>
  byDensity(density, ["px-2 py-1", "px-3 py-1.5", "px-4 py-2.5"]);

export const densityGap = (density?: Densities) =>
  byDensity(density, ["gap-1", "gap-2", "gap-3"]);

export const densityIconSize = (density?: Densities) => byDensity(density, [12, 16, 20]);

export const densityHeight = (density?: Densities) =>
  byDensity(density, ["h-7", "h-9", "h-11"]);

export function alignStyle(orientation: Orientation, align?: Align): React.CSSProperties {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: orientation === "Horizontal" ? "row" : "column",
  };
  switch (align) {
    case "TopLeft":
      return { ...style, alignItems: "flex-start", justifyContent: "flex-start" };
    case "TopCenter":
      return { ...style, alignItems: "center", justifyContent: "flex-start" };
    case "TopRight":
      return { ...style, alignItems: "flex-end", justifyContent: "flex-start" };
    case "BottomLeft":
      return { ...style, alignItems: "flex-start", justifyContent: "flex-end" };
    case "BottomCenter":
      return { ...style, alignItems: "center", justifyContent: "flex-end" };
    case "BottomRight":
      return { ...style, alignItems: "flex-end", justifyContent: "flex-end" };
    case "Left":
      return { ...style, alignItems: "center", justifyContent: "flex-start" };
    case "Right":
      return { ...style, alignItems: "center", justifyContent: "flex-end" };
    case "Center":
      return { ...style, alignItems: "center", justifyContent: "center" };
    case "SpaceBetween":
      return { ...style, justifyContent: "space-between" };
    case "SpaceAround":
      return { ...style, justifyContent: "space-around" };
    case "SpaceEvenly":
      return { ...style, justifyContent: "space-evenly" };
    case "Stretch":
      return { ...style, alignItems: "stretch" };
    default:
      return style;
  }
}

export const textAlignClass = (alignment?: TextAlignment) =>
  ({ Left: "text-left", Center: "text-center", Right: "text-right", Justify: "text-justify" })[
    alignment ?? "Left"
  ];

export const overflowClass = (overflow?: Overflow) =>
  ({
    Clip: "overflow-hidden",
    Ellipsis: "overflow-hidden text-ellipsis whitespace-nowrap",
    Auto: "overflow-auto",
    Visible: "overflow-visible",
    Scroll: "overflow-scroll",
  })[overflow ?? "Visible"];

/** Turns any stable string into a deterministic rough.js seed. */
export function seedFrom(value: string | number | undefined): number {
  const text = String(value ?? "tendril");
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(hash) % 100000;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
