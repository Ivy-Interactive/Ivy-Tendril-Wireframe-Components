/**
 * How big a label is.
 *
 * Nothing here touches the DOM, a canvas, or the font. That is the whole point, and it was
 * arrived at the hard way.
 *
 * The first version measured a hidden DOM node with a `ResizeObserver` — real wrapping, real
 * metrics, free. It failed `wireframe screenshot --repeat` on roughly one run in three: the
 * screenshot runner starts from a cold browser profile, so Balsamiq Sans arrives at a
 * different point in the render each time, and the correcting re-measure settled a fraction
 * of a pixel from where a warm reload settled. One box a pixel wider shifts everything below
 * it. Quantising did not help — a grid only moves the boundary the wobble crosses. Nor did
 * waiting on `document.fonts.ready`, which resolves before a lazily-used face has even been
 * requested. Canvas `measureText` after an explicit `document.fonts.load` got the failure
 * rate down to about one in six, but "usually identical" is not what a byte-for-byte
 * comparison means.
 *
 * So the layout no longer asks the browser anything. Widths come from a table of glyph
 * classes, which makes a node's size a pure function of its label — the same on a cold run,
 * a warm run, and a machine that has never had the font. Boxes end up a little roomier than
 * a perfect fit, which on a hand-drawn wireframe reads as deliberate rather than as slack.
 */

/**
 * Glyph widths as a fraction of the font size, for Balsamiq Sans at the sizes labels use.
 *
 * Grouped by how wide the glyph actually is rather than measured per character: the point is
 * a stable estimate, and a table of 200 entries would imply a precision this does not have.
 */
const NARROW = new Set("iIl1.,;:'\"`|!()[]{}jft/\\-");
const WIDE = new Set("mMWQ@%&");
const CAPITAL = new Set("ABCDEFGHJKLNOPRSTUVXYZ0");

const WIDTH_NARROW = 0.3;
const WIDTH_WIDE = 0.88;
const WIDTH_CAPITAL = 0.64;
const WIDTH_SPACE = 0.28;
const WIDTH_DEFAULT = 0.53;

/** Width of one line, in pixels, at `fontSize`. */
function lineWidth(text: string, fontSize: number): number {
  let total = 0;
  for (const character of text) {
    if (character === " ") total += WIDTH_SPACE;
    else if (NARROW.has(character)) total += WIDTH_NARROW;
    else if (WIDE.has(character)) total += WIDTH_WIDE;
    else if (CAPITAL.has(character)) total += WIDTH_CAPITAL;
    else total += WIDTH_DEFAULT;
  }
  return total * fontSize;
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
 * A single word longer than `maxWidth` overflows rather than breaking mid-word: an
 * identifier split across two lines is harder to read than a slightly wide box.
 */
export function measureLabel(
  text: string,
  fontSize: number,
  maxWidth: number,
  lineHeight = 1.3,
): MeasuredLabel {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) {
    return { width: 0, height: Math.ceil(fontSize * lineHeight), lines: [] };
  }

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (lineWidth(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);

  return {
    width: Math.ceil(Math.max(...lines.map((line) => lineWidth(line, fontSize)))),
    height: Math.ceil(lines.length * fontSize * lineHeight),
    lines,
  };
}
