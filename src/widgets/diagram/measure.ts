/**
 * How big a label is.
 *
 * This started as a hidden DOM node measured with a `ResizeObserver`, which gets real
 * wrapping and real font metrics for free. It also broke `wireframe screenshot --repeat`
 * about one run in three: a box would come out a pixel wider than it had the run before,
 * every downstream position shifted, and the PNGs stopped matching. Quantising the result
 * did not fix it — a grid only moves the boundary the wobble crosses.
 *
 * Canvas `measureText` is a pure function of the font and the string, with no layout, no
 * observer and no timing, so identical inputs give identical numbers. The cost is that the
 * wrapping is ours to do — which turns out to be a benefit, because the caller can render
 * the exact lines that were measured instead of hoping CSS breaks the text the same way.
 */

/** Must match the family the labels actually render in, or the numbers describe nothing. */
const FONT_STACK = '"Balsamiq Sans", ui-sans-serif, system-ui, sans-serif';

/** Roughly the average glyph width of this face, for when there is no canvas at all. */
const AVERAGE_GLYPH = 0.52;

let cached: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (cached !== undefined) return cached;
  try {
    cached = document.createElement("canvas").getContext("2d");
  } catch {
    cached = null; // no DOM, or canvas is blocked
  }
  return cached;
}

export interface MeasuredLabel {
  width: number;
  height: number;
  /** The lines as they were measured. Render these, not the original string. */
  lines: string[];
}

/**
 * Measures a label, wrapping it greedily to fit `maxWidth`.
 *
 * A single word longer than `maxWidth` is left to overflow rather than broken mid-word —
 * an identifier split across two lines is harder to read than a slightly wide box.
 */
export function measureLabel(
  text: string,
  fontSize: number,
  maxWidth: number,
  lineHeight = 1.3,
): MeasuredLabel {
  const canvas = context();
  if (canvas) canvas.font = `${fontSize}px ${FONT_STACK}`;

  const widthOf = (value: string) =>
    canvas ? canvas.measureText(value).width : value.length * fontSize * AVERAGE_GLYPH;

  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return { width: 0, height: Math.ceil(fontSize * lineHeight), lines: [] };
  }

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (widthOf(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);

  const width = Math.ceil(Math.max(...lines.map(widthOf)));
  const height = Math.ceil(lines.length * fontSize * lineHeight);

  return { width, height, lines };
}

/**
 * Whether the real face is available yet.
 *
 * `document.fonts.ready` is not the right question: a face is only fetched when something
 * first needs it, so ready can resolve before Balsamiq Sans has even been requested, and a
 * measurement taken then describes the fallback. `load()` asks for it explicitly.
 */
export function whenFontReady(fontSize: number): Promise<unknown> {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load(`${fontSize}px "Balsamiq Sans"`),
    document.fonts.load(`bold ${fontSize}px "Balsamiq Sans"`),
  ]);
}
