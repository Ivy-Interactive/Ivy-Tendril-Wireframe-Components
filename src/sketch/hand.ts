/**
 * Geometry the pencil layer needs and rough.js does not provide: a repeatable
 * hand, and the point runs the freehand marks are built from.
 *
 * rough.js supplies the wobble along a stroke. What it cannot do is decide
 * *where* a stroke goes — the sweep of a brace, the columns of a scribble, the
 * barbs on an arrowhead — so those runs are laid out here and handed to
 * `RoughShape` to be drawn.
 */
import { seedFrom } from "@/lib/utils";

export type Pt = [number, number];

/**
 * A repeatable hand. Same seed, same wobble, every render — the sketch layer's
 * `deterministic` promise extends to the marks built on top of it.
 */
export function handRng(seed: string | number | undefined): () => number {
  let a = seedFrom(seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An SVG path for a rounded rectangle. Falls back to a plain box at radius 0. */
export function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
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

/**
 * Samples a quadratic from `from` to `to` whose control point is pushed
 * `bend` pixels off the perpendicular. A bend of 0 gives a straight run, which
 * rough.js then draws with its own wobble.
 */
export function bendPoints(from: Pt, to: Pt, bend: number, steps = 10): Pt[] {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const mx = from[0] + dx / 2 + px * bend;
  const my = from[1] + dy / 2 + py * bend;

  const points: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const it = 1 - t;
    points.push([
      it * it * from[0] + 2 * it * t * mx + t * t * to[0],
      it * it * from[1] + 2 * it * t * my + t * t * to[1],
    ]);
  }
  return points;
}
