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

/**
 * The theme tokens, under the names the stylesheet uses.
 *
 * `agent-readme` teaches these as Tailwind utilities -- `bg-paper-sunken`, `text-ink-muted`
 * -- and then hands out props called `color` and `background`. Every signal says the two
 * vocabularies are the same, so they are now: a colour prop takes a token name too.
 */
const TOKENS: Record<string, string> = {
  ink: INK,
  "ink-muted": INK_MUTED,
  "ink-faint": INK_FAINT,
  paper: PAPER,
  "paper-raised": PAPER_RAISED,
  "paper-sunken": PAPER_SUNKEN,
  highlight: HIGHLIGHT,
  accent: PALETTE.Info,
  success: PALETTE.Success,
  warning: PALETTE.Warning,
  destructive: PALETTE.Destructive,
  info: PALETTE.Info,
  muted: PALETTE.Muted,
  primary: PALETTE.Primary,
  secondary: PALETTE.Secondary,
};

/**
 * Whether a string is something CSS would actually accept as a colour.
 *
 * Needed because the old behaviour was to pass anything unrecognised straight through, and
 * an unresolvable value reaches SVG as an invalid presentation attribute -- which SVG
 * ignores, leaving its initial fill: **black**. So a mistyped or unsupported colour did not
 * degrade quietly, it painted solid black over the drawing. Black is the worst possible
 * fallback: maximally visible, and nothing in the build or the linter mentions it.
 */
function looksLikeCss(value: string): boolean {
  if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return true;
  if (/^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|var)\s*\(/i.test(value)) {
    return true;
  }
  return CSS_NAMED_COLORS.has(value.toLowerCase());
}

/**
 * Accepts an Ivy colour name (`"Destructive"`), a theme token (`"paper-sunken"`), or any CSS
 * colour. Anything else returns the fallback rather than painting black, and says so once.
 */
export function resolveColor(color?: string | null, fallback = INK): string {
  if (!color) return fallback;

  const named = PALETTE[color as TendrilColor];
  if (named) return named;

  const token = TOKENS[color];
  if (token) return token;

  if (looksLikeCss(color)) return color;

  warnOnce(color);
  return fallback;
}

const warned = new Set<string>();

/**
 * One warning per bad value, not one per render.
 *
 * A wireframe redraws on every measurement, so warning unconditionally would bury the
 * console -- and the console is the only place this can be said, since a colour prop is not
 * something the build or the class linter ever sees.
 */
function warnOnce(color: string) {
  if (warned.has(color) || typeof console === "undefined") return;
  warned.add(color);
  console.warn(
    `[tendril] "${color}" is not a colour this library knows. Use an Ivy name ` +
      `("Destructive"), a theme token ("paper-sunken", "ink-muted"), or a CSS colour ` +
      `("#efe9dd"). Falling back rather than painting black.`,
  );
}

/**
 * The CSS named colours, so a legitimate `"rebeccapurple"` still passes through.
 *
 * The full list rather than a curated subset: the point of the check is to tell a real
 * colour from a token that does not exist, and a short list would reject valid CSS.
 */
const CSS_NAMED_COLORS = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
  "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
  "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
  "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
  "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
  "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
  "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
  "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
  "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo",
  "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
  "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
  "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
  "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen",
  "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple",
  "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
  "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite",
  "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid",
  "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip",
  "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
  "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow",
  "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet",
  "wheat", "white", "whitesmoke", "yellow", "yellowgreen",
  // Keywords that are colours in every practical sense.
  "transparent", "currentcolor", "inherit", "initial", "unset", "none",
]);

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

/**
 * Named surfaces. Every widget fill comes from here rather than a literal hex,
 * so the whole sheet stays on one paper stock.
 */
export const SURFACE = {
  /** Cards, lists, tables, menus — anything sitting on top of the page. */
  raised: PAPER_RAISED,
  /** Table headers, terminals — anything pressed into the page. */
  sunken: PAPER_SUNKEN,
  /** Chat transcripts and other large reading areas. */
  quiet: "#fbfaf5",
  /** Code listings and editors. */
  code: "#f7f6f1",
  /** The primary button and other "pressed pencil" fills. */
  pressed: "#e8e5db",
  /** The secondary button. */
  muted: "#f4f2ec",
  /** Highlighted rows, hovered menu items, active drop targets. */
  highlight: HIGHLIGHT,
} as const;

/**
 * Stroke weights, so a border's weight always means the same thing:
 * hairline for grid lines, regular for a resting edge, emphasis for focus or
 * selection, heavy for a modal.
 */
export const STROKE = {
  hairline: 0.8,
  thin: 1.1,
  regular: 1.3,
  emphasis: 1.6,
  heavy: 1.8,
} as const;
