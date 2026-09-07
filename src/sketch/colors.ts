/**
 * Ivy widgets take colors as names from `Ivy.Colors`. A wireframe palette is
 * deliberately desaturated: everything reads as pencil on paper, with just
 * enough hue left to keep semantic colors apart.
 */
export type TendrilColor =
  | "Black"
  | "White"
  | "Slate"
  | "Gray"
  | "Zinc"
  | "Neutral"
  | "Stone"
  | "Red"
  | "Orange"
  | "Amber"
  | "Yellow"
  | "Lime"
  | "Green"
  | "Emerald"
  | "Teal"
  | "Cyan"
  | "Sky"
  | "Blue"
  | "Indigo"
  | "Violet"
  | "Purple"
  | "Fuchsia"
  | "Pink"
  | "Rose"
  | "Primary"
  | "Secondary"
  | "Destructive"
  | "Success"
  | "Warning"
  | "Info"
  | "Muted";

export const INK = "#2f2f2f";
export const INK_MUTED = "#8b8b8b";
export const INK_FAINT = "#c3c3c3";
export const PAPER = "#fdfcf7";
export const PAPER_RAISED = "#ffffff";
export const PAPER_SUNKEN = "#f2f0e9";
export const HIGHLIGHT = "#fff6c8";

const PALETTE: Record<TendrilColor, string> = {
  Black: "#1c1c1c",
  White: "#ffffff",
  Slate: "#6b7480",
  Gray: "#7a7a7a",
  Zinc: "#77767b",
  Neutral: "#7c7c7c",
  Stone: "#7d7772",
  Red: "#b04a3f",
  Orange: "#b0663f",
  Amber: "#b0873f",
  Yellow: "#a99539",
  Lime: "#7e9a3f",
  Green: "#4f7d4a",
  Emerald: "#3f8a6d",
  Teal: "#3f8583",
  Cyan: "#3f8093",
  Sky: "#4479a3",
  Blue: "#3f6fa8",
  Indigo: "#5a5f9e",
  Violet: "#6f579e",
  Purple: "#80519a",
  Fuchsia: "#96538f",
  Pink: "#a3547e",
  Rose: "#a84f66",
  Primary: "#2f2f2f",
  Secondary: "#8b8b8b",
  Destructive: "#b04a3f",
  Success: "#4f7d4a",
  Warning: "#b07d2b",
  Info: "#3f6fa8",
  Muted: "#8b8b8b",
};

/** Accepts an Ivy color name, a raw CSS color, or nothing. */
export function resolveColor(color?: string | null, fallback = INK): string {
  if (!color) return fallback;
  const named = PALETTE[color as TendrilColor];
  if (named) return named;
  return color;
}

/** Deterministic series colors for charts, in wireframe pencil tones. */
export const CHART_DEFAULT: string[] = [
  "#3f3f3f",
  "#7a7a7a",
  "#a6a6a6",
  "#5b5b5b",
  "#8f8f8f",
  "#c0c0c0",
  "#4a4a4a",
  "#9c9c9c",
];

export const CHART_RAINBOW: string[] = [
  "#b04a3f",
  "#b0873f",
  "#4f7d4a",
  "#3f8583",
  "#3f6fa8",
  "#6f579e",
  "#a3547e",
  "#7e9a3f",
];

export type ColorScheme = "Default" | "Rainbow";

export const seriesColor = (scheme: ColorScheme | undefined, index: number) => {
  const palette = scheme === "Rainbow" ? CHART_RAINBOW : CHART_DEFAULT;
  return palette[index % palette.length];
};

function toRgb(hex: string): [number, number, number] | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  let value = match[1];
  if (value.length === 3) value = value.replace(/./g, (c) => c + c);
  const int = parseInt(value, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Mixes a color toward paper. `amount` 0 keeps it, 1 washes it out entirely. */
export function tint(color: string, amount = 0.88, towards = PAPER_RAISED): string {
  const from = toRgb(color);
  const to = toRgb(towards);
  if (!from || !to) return color;
  const mixed = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * amount),
  );
  return `#${mixed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
