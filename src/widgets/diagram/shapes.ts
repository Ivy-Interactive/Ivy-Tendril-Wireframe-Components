/**
 * Flowchart node geometry.
 *
 * One rule holds this file together: the polygon a shape is *drawn* from is the same
 * polygon an edge is *anchored* against. Keep two descriptions of a diamond and the arrow
 * eventually points at where the box used to be — a bug that only shows up on one shape at
 * one aspect ratio, which is exactly the kind that survives into a mockup someone presents.
 */
import type { Pt } from "@/sketch/hand";

/**
 * The standard flowchart vocabulary, named the way the diagrams themselves are read rather
 * than by geometry — a `Decision` rather than a diamond, so swapping its drawn shape later
 * does not rename the API.
 */
export type FlowShape =
  /** A step. The default, and most of any chart. */
  | "Process"
  /** A branch. Its outgoing edges are the ones worth labelling. */
  | "Decision"
  /** A start or an end. */
  | "Terminator"
  /** Data in or out. */
  | "InputOutput"
  /** A setup step, before the work proper. */
  | "Preparation"
  /** A step a person does. */
  | "Manual"
  /** Something printed or produced. */
  | "Document"
  /** Stored state. */
  | "Database"
  /** A join to somewhere else on the page. */
  | "Connector"
  /** An aside. Not part of the flow; usually the target of a dashed edge. */
  | "Note";

/** A node's box in diagram pixels. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** How much of the box the label may use, once the shape has taken its bite out of it. */
interface Inset {
  x: number;
  y: number;
}

/**
 * The slanted and pointed shapes waste their corners, so a label sized for a rectangle
 * overflows them. These are the fractions of the box each shape gives back.
 */
const LABEL_INSET: Record<FlowShape, Inset> = {
  Process: { x: 0.08, y: 0.14 },
  Decision: { x: 0.22, y: 0.2 },
  Terminator: { x: 0.14, y: 0.14 },
  InputOutput: { x: 0.16, y: 0.14 },
  Preparation: { x: 0.16, y: 0.14 },
  Manual: { x: 0.14, y: 0.14 },
  Document: { x: 0.08, y: 0.16 },
  Database: { x: 0.08, y: 0.22 },
  Connector: { x: 0.2, y: 0.2 },
  Note: { x: 0.09, y: 0.14 },
};

/**
 * How much bigger than its label a node has to be. A decision has to grow a lot, because a
 * diamond only offers its full width on one line through the middle.
 */
export const SHAPE_PADDING: Record<FlowShape, { x: number; y: number }> = {
  Process: { x: 24, y: 16 },
  Decision: { x: 76, y: 40 },
  Terminator: { x: 34, y: 16 },
  InputOutput: { x: 34, y: 16 },
  Preparation: { x: 36, y: 16 },
  Manual: { x: 30, y: 16 },
  Document: { x: 24, y: 26 },
  Database: { x: 24, y: 32 },
  Connector: { x: 20, y: 20 },
  Note: { x: 26, y: 18 },
};

/** Samples an ellipse arc; used for the round ends the polygon has to approximate. */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps: number): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = from + ((to - from) * i) / steps;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry] as Pt;
  });
}

/**
 * The outline of a shape, clockwise from its top-left, in absolute diagram coordinates.
 *
 * Everything is a polygon, including the round shapes — a terminator's ends and a database's
 * lip are sampled arcs. rough.js is going to redraw the whole thing with a wobble anyway, so
 * the extra vertices cost nothing visually and buy one intersection routine instead of one
 * per shape.
 */
export function shapeOutline(shape: FlowShape, rect: Rect): Pt[] {
  const { x, y, width: w, height: h } = rect;
  const right = x + w;
  const bottom = y + h;
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (shape) {
    case "Decision":
      return [
        [cx, y],
        [right, cy],
        [cx, bottom],
        [x, cy],
      ];

    case "Terminator": {
      const r = Math.min(h / 2, w / 2);
      return [
        [x + r, y],
        [right - r, y],
        ...arc(right - r, cy, r, h / 2, -Math.PI / 2, Math.PI / 2, 8),
        [x + r, bottom],
        ...arc(x + r, cy, r, h / 2, Math.PI / 2, (Math.PI * 3) / 2, 8),
      ];
    }

    case "InputOutput": {
      const slant = Math.min(w * 0.18, h * 0.55);
      return [
        [x + slant, y],
        [right, y],
        [right - slant, bottom],
        [x, bottom],
      ];
    }

    case "Preparation": {
      const point = Math.min(w * 0.16, h * 0.6);
      return [
        [x + point, y],
        [right - point, y],
        [right, cy],
        [right - point, bottom],
        [x + point, bottom],
        [x, cy],
      ];
    }

    case "Manual": {
      // Wide at the top, narrow at the foot — the standard "manual operation" symbol, and
      // the opposite way up from the trapezoid it is easy to mistake it for.
      const slant = Math.min(w * 0.14, h * 0.5);
      return [
        [x, y],
        [right, y],
        [right - slant, bottom],
        [x + slant, bottom],
      ];
    }

    case "Connector": {
      const r = Math.min(w, h) / 2;
      return arc(cx, cy, r, r, -Math.PI / 2, (Math.PI * 3) / 2, 20);
    }

    case "Document": {
      // A foot that dips and rises again, drawn right to left so the ring stays clockwise.
      const fold = Math.min(h * 0.18, 14);
      const foot: Pt[] = Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        return [right - t * w, bottom - fold + Math.sin(t * Math.PI * 2) * fold * 0.55];
      });
      return [[x, y], [right, y], ...foot];
    }

    case "Database": {
      const lip = Math.min(h * 0.16, 12);
      const belly: Pt[] = Array.from({ length: 11 }, (_, i) => {
        const t = i / 10;
        return [right - t * w, bottom - lip + Math.sin(t * Math.PI) * lip];
      });
      return [
        ...arc(cx, y + lip, w / 2, lip, -Math.PI, 0, 10),
        [right, bottom - lip],
        ...belly,
      ];
    }

    case "Note": {
      const fold = Math.min(w * 0.18, h * 0.32, 16);
      return [
        [x, y],
        [right - fold, y],
        [right, y + fold],
        [right, bottom],
        [x, bottom],
      ];
    }

    case "Process":
    default:
      return [
        [x, y],
        [right, y],
        [right, bottom],
        [x, bottom],
      ];
  }
}

/**
 * The rectangle a node's label may occupy, given its box. Keeps text off the slanted edges
 * and out of a diamond's points.
 */
export function labelBox(shape: FlowShape, rect: Rect): Rect {
  const inset = LABEL_INSET[shape] ?? LABEL_INSET.Process;
  const dx = rect.width * inset.x;
  const dy = rect.height * inset.y;
  return {
    x: rect.x + dx,
    y: rect.y + dy,
    width: Math.max(0, rect.width - dx * 2),
    height: Math.max(0, rect.height - dy * 2),
  };
}

/** Where two segments cross, or null when they do not. */
function segmentIntersection(a1: Pt, a2: Pt, b1: Pt, b2: Pt): Pt | null {
  const dax = a2[0] - a1[0];
  const day = a2[1] - a1[1];
  const dbx = b2[0] - b1[0];
  const dby = b2[1] - b1[1];

  const denominator = dax * dby - day * dbx;
  if (Math.abs(denominator) < 1e-9) return null; // parallel

  const t = ((b1[0] - a1[0]) * dby - (b1[1] - a1[1]) * dbx) / denominator;
  const u = ((b1[0] - a1[0]) * day - (b1[1] - a1[1]) * dax) / denominator;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return [a1[0] + dax * t, a1[1] + day * t];
}

/**
 * Where an edge heading for `towards` should leave a node: the point where the ray from the
 * node's centre crosses its outline.
 *
 * Falls back to the centre when the target is inside the shape, which only happens for
 * overlapping nodes — an edge drawn centre-to-centre is ugly but visible, and visible is
 * what a wireframe needs from a degenerate case.
 */
export function anchorOn(outline: Pt[], centre: Pt, towards: Pt): Pt {
  const dx = towards[0] - centre[0];
  const dy = towards[1] - centre[1];
  if (Math.hypot(dx, dy) < 1e-6) return centre;

  // Long enough to leave any node, whatever its size.
  const far: Pt = [centre[0] + dx * 1000, centre[1] + dy * 1000];

  let best: Pt | null = null;
  let bestDistance = Infinity;

  for (let i = 0; i < outline.length; i++) {
    const hit = segmentIntersection(centre, far, outline[i], outline[(i + 1) % outline.length]);
    if (!hit) continue;

    const distance = Math.hypot(hit[0] - centre[0], hit[1] - centre[1]);
    // The nearest crossing is the one on the near side of a concave shape.
    if (distance < bestDistance) {
      bestDistance = distance;
      best = hit;
    }
  }

  return best ?? centre;
}

/** The centre of a rect, as a point. */
export const centreOf = (rect: Rect): Pt => [rect.x + rect.width / 2, rect.y + rect.height / 2];
