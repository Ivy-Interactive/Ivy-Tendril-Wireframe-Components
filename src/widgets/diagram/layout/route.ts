/**
 * Turns a laid-out graph into the point runs the pencil draws.
 *
 * Routing is separate from layout because the two answer different questions. Layout decides
 * where boxes go; routing decides how a line gets between them without crossing one — and it
 * needs the node outlines to do it, which the layout deliberately knows nothing about.
 */
import { bendPoints, type Pt } from "@/sketch/hand";
import { anchorOn, centreOf, shapeOutline, type FlowShape, type Rect } from "../shapes";
import type { EdgeStyle, FlowDirection, PlacedEdge, PlacedNode } from "./types";

export interface RoutedEdge {
  /** The point run, ready for a `linearPath` or `curve` shape. */
  points: Pt[];
  /** Where the arrowhead goes, and the point it should aim back along. */
  tip: Pt;
  from: Pt;
  /** Where an edge label sits, if it has one. */
  label: Pt;
  index: number;
}

interface Routable {
  edge: PlacedEdge;
  index: number;
  source: PlacedNode;
  target: PlacedNode;
  sourceShape: FlowShape;
  targetShape: FlowShape;
}

const rectOf = (node: PlacedNode): Rect => ({
  x: node.x,
  y: node.y,
  width: node.width,
  height: node.height,
});

/** Whether the flow runs along x rather than y. */
const isHorizontal = (direction: FlowDirection) =>
  direction === "Right" || direction === "Left";

/**
 * Right-angled segments between two points, turning at the midpoint of the flow axis.
 *
 * This is the classic flowchart look, and it falls out of the layout almost free: the
 * dummy nodes already sit where the line has to bend.
 */
function elbow(from: Pt, to: Pt, direction: FlowDirection): Pt[] {
  const horizontal = isHorizontal(direction);
  const same = horizontal ? Math.abs(from[1] - to[1]) < 1 : Math.abs(from[0] - to[0]) < 1;
  if (same) return [from, to];

  if (horizontal) {
    const mid = (from[0] + to[0]) / 2;
    return [from, [mid, from[1]], [mid, to[1]], to];
  }
  const mid = (from[1] + to[1]) / 2;
  return [from, [from[0], mid], [to[0], mid], to];
}

/** Removes points that sit on the segment they join, which rough.js would draw as a kink. */
function simplify(points: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const point of points) {
    const last = out[out.length - 1];
    if (last && Math.abs(last[0] - point[0]) < 0.5 && Math.abs(last[1] - point[1]) < 0.5) continue;
    out.push(point);
  }
  return out.length >= 2 ? out : points.slice(0, 2);
}

/**
 * An edge that leaves and returns to the same node: a loop out to one side.
 *
 * Drawn rather than routed, because there is no gap between ranks to route through.
 */
function selfLoop(node: PlacedNode, direction: FlowDirection): Pt[] {
  const rect = rectOf(node);
  const reach = Math.min(46, Math.max(26, rect.height * 0.8));

  if (isHorizontal(direction)) {
    const x1 = rect.x + rect.width * 0.3;
    const x2 = rect.x + rect.width * 0.7;
    const y = rect.y;
    return [
      [x1, y],
      [x1, y - reach],
      [x2, y - reach],
      [x2, y],
    ];
  }

  const y1 = rect.y + rect.height * 0.3;
  const y2 = rect.y + rect.height * 0.7;
  const x = rect.x + rect.width;
  return [
    [x, y1],
    [x + reach, y1],
    [x + reach, y2],
    [x, y2],
  ];
}

/**
 * Routes every edge.
 *
 * @param shapeOf the shape of each node, so the line can stop on its outline rather than its
 *   bounding box — the difference between an arrow touching a diamond and an arrow ending in
 *   the white space beside one.
 */
export function routeEdges(
  nodes: PlacedNode[],
  edges: PlacedEdge[],
  shapeOf: (id: string) => FlowShape,
  direction: FlowDirection,
  style: EdgeStyle,
): RoutedEdge[] {
  const byId = new Map(nodes.map((node) => [node.id, node] as const));

  const routable: Routable[] = [];
  edges.forEach((edge, index) => {
    const source = byId.get(edge.from);
    const target = byId.get(edge.to);
    // An edge naming a node that does not exist is dropped rather than thrown: the parser
    // already reported it, and half a chart beats no chart.
    if (!source || !target) return;
    routable.push({
      edge,
      index,
      source,
      target,
      sourceShape: shapeOf(edge.from),
      targetShape: shapeOf(edge.to),
    });
  });

  return routable.map(({ edge, index, source, target, sourceShape, targetShape }) => {
    if (source.id === target.id) {
      const loop = selfLoop(source, direction);
      return {
        points: loop,
        tip: loop[loop.length - 1],
        from: loop[loop.length - 2],
        label: loop[1],
        index,
      };
    }

    const sourceRect = rectOf(source);
    const targetRect = rectOf(target);
    const sourceCentre = centreOf(sourceRect);
    const targetCentre = centreOf(targetRect);

    // An edge is only ever reversed to rank the graph. It is drawn the way it was written —
    // from the author's source to the author's target — so the arrowhead lands where they
    // meant it to. Only the waypoints need flipping, because they were collected walking
    // down the ranks.
    const via = edge.reversed ? [...edge.waypoints].reverse() : edge.waypoints;
    const start = sourceCentre;
    const end = targetCentre;
    const startShape = sourceShape;
    const endShape = targetShape;
    const startRect = sourceRect;
    const endRect = targetRect;

    const spine: Pt[] = [start, ...via, end];

    // Anchor on the outlines, aiming at the next and previous points on the spine.
    const startAnchor = anchorOn(shapeOutline(startShape, startRect), start, spine[1]);
    const endAnchor = anchorOn(
      shapeOutline(endShape, endRect),
      end,
      spine[spine.length - 2],
    );

    const corners: Pt[] = [startAnchor, ...via, endAnchor];

    let points: Pt[];
    if (style === "Straight") {
      points = corners;
    } else if (style === "Curved") {
      // Bow each leg slightly; a straight leg still gets rough.js's own wobble.
      points = [];
      for (let i = 0; i < corners.length - 1; i++) {
        const leg = bendPoints(corners[i], corners[i + 1], 0, 6);
        points.push(...(i === 0 ? leg : leg.slice(1)));
      }
    } else {
      points = [];
      for (let i = 0; i < corners.length - 1; i++) {
        const leg = elbow(corners[i], corners[i + 1], direction);
        points.push(...(i === 0 ? leg : leg.slice(1)));
      }
    }

    points = simplify(points);

    // The label goes on the longest segment, which is the one with room for it.
    let best = 0;
    let bestLength = -1;
    for (let i = 0; i < points.length - 1; i++) {
      const length = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
      if (length > bestLength) {
        bestLength = length;
        best = i;
      }
    }
    const label: Pt = [
      (points[best][0] + points[best + 1][0]) / 2,
      (points[best][1] + points[best + 1][1]) / 2,
    ];

    return {
      points,
      tip: points[points.length - 1],
      // Aim the head back along the run, not at the far end, so a bent edge's head follows
      // the last leg round — the same trick WireframeArrow uses.
      from: points[Math.max(0, points.length - 2)],
      label,
      index,
    };
  });
}
