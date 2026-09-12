/**
 * Layered graph layout, hand-rolled.
 *
 * The same family of algorithm dagre and Graphviz use, cut down to what a wireframe needs:
 * rank the nodes, order them to reduce crossings, place them, and let the router take it
 * from there. Nothing here touches the DOM, so it is a pure function of its inputs — which
 * is what keeps screenshots byte-identical between runs.
 *
 * The pipeline only ever solves the "Down" case. The other three directions are a
 * transposition applied to the finished coordinates, which is a great deal easier to get
 * right than three more cases in every step.
 */
import type {
  EdgeStyle,
  FlowDirection,
  LayoutEdge,
  LayoutNode,
  LayoutOptions,
  Placed,
  PlacedEdge,
  PlacedNode,
} from "./types";

/** A node the user never wrote: a waypoint for an edge crossing a rank it does not stop at. */
interface Dummy {
  id: string;
  rank: number;
  order: number;
  x: number;
  width: number;
  height: number;
  /** Index of the edge this waypoint belongs to. */
  edge: number;
}

interface Ranked {
  order: string[];
  rank: Map<string, number>;
  /** Edges with their direction normalised to run down the ranks. */
  forward: Array<{ from: string; to: string; edge: number; reversed: boolean }>;
}

/**
 * Reverses the edges that run against the flow, so the graph can be ranked.
 *
 * A flowchart's retry loop — validate, fail, go back — is a cycle, and the Sankey layout
 * this borrows from has no answer for one: it relaxes until its pass counter runs out and
 * leaves the ranks saturated. Here a back edge is reversed for the maths and flagged, so the
 * renderer can draw it pointing the way the author wrote it.
 */
function breakCycles(nodes: LayoutNode[], edges: LayoutEdge[]) {
  const outgoing = new Map<string, number[]>();
  nodes.forEach((node) => outgoing.set(node.id, []));
  edges.forEach((edge, index) => outgoing.get(edge.from)?.push(index));

  const state = new Map<string, 0 | 1 | 2>(); // unvisited / on the stack / done
  const reversed = new Set<number>();

  // Iterative DFS: a deep chart would otherwise be able to blow the call stack, and a
  // wireframe of a long process is exactly that.
  for (const root of nodes) {
    if (state.get(root.id)) continue;

    const stack: Array<{ id: string; next: number }> = [{ id: root.id, next: 0 }];
    state.set(root.id, 1);

    while (stack.length > 0) {
      const frame = stack[stack.length - 1];
      const edgeIndices = outgoing.get(frame.id) ?? [];

      if (frame.next >= edgeIndices.length) {
        state.set(frame.id, 2);
        stack.pop();
        continue;
      }

      const index = edgeIndices[frame.next++];
      const target = edges[index].to;
      if (!outgoing.has(target)) continue; // an edge to a node that does not exist

      const seen = state.get(target) ?? 0;
      if (seen === 1) {
        reversed.add(index); // points back at something still on the stack
      } else if (seen === 0) {
        state.set(target, 1);
        stack.push({ id: target, next: 0 });
      }
    }
  }

  return reversed;
}

/** Longest-path ranking over the acyclic graph. */
function assignRanks(nodes: LayoutNode[], edges: LayoutEdge[], reversed: Set<number>): Ranked {
  const rank = new Map<string, number>();
  nodes.forEach((node) => rank.set(node.id, 0));

  const forward = edges
    .map((edge, index) => {
      const isReversed = reversed.has(index);
      return {
        from: isReversed ? edge.to : edge.from,
        to: isReversed ? edge.from : edge.to,
        edge: index,
        reversed: isReversed,
      };
    })
    .filter((edge) => rank.has(edge.from) && rank.has(edge.to) && edge.from !== edge.to);

  // Relax until nothing moves. Bounded by the node count because the graph is acyclic.
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const edge of forward) {
      const candidate = rank.get(edge.from)! + 1;
      if (rank.get(edge.to)! < candidate) {
        rank.set(edge.to, candidate);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return { order: nodes.map((n) => n.id), rank, forward };
}

/**
 * Orders the nodes within each rank to reduce edge crossings.
 *
 * The median heuristic: a node wants to sit at the median position of its neighbours in the
 * rank above (or below, on the return sweep). Six alternating sweeps is well past the point
 * of diminishing returns at wireframe scale.
 *
 * Every tie breaks on the node's original index. That is not a detail — a tie broken on
 * insertion order or object identity would make the layout depend on things that vary
 * between runs, and the screenshots would stop matching.
 */
function reduceCrossings(
  ranks: string[][],
  forward: Ranked["forward"],
  indexOf: Map<string, number>,
) {
  const up = new Map<string, string[]>();
  const down = new Map<string, string[]>();
  for (const edge of forward) {
    if (!up.has(edge.to)) up.set(edge.to, []);
    if (!down.has(edge.from)) down.set(edge.from, []);
    up.get(edge.to)!.push(edge.from);
    down.get(edge.from)!.push(edge.to);
  }

  const positions = new Map<string, number>();
  const readPositions = () =>
    ranks.forEach((rank) => rank.forEach((id, i) => positions.set(id, i)));
  readPositions();

  const median = (id: string, neighbours: Map<string, string[]>) => {
    const found = (neighbours.get(id) ?? [])
      .map((other) => positions.get(other))
      .filter((p): p is number => p !== undefined)
      .sort((a, b) => a - b);
    if (found.length === 0) return -1;
    const middle = found.length / 2;
    return found.length % 2 === 1
      ? found[Math.floor(middle)]
      : (found[middle - 1] + found[middle]) / 2;
  };

  for (let sweep = 0; sweep < 6; sweep++) {
    const downward = sweep % 2 === 0;
    const sequence = downward
      ? ranks.map((_, i) => i).slice(1)
      : ranks.map((_, i) => i).slice(0, -1).reverse();

    for (const index of sequence) {
      const neighbours = downward ? up : down;
      const keyed = ranks[index].map((id) => ({ id, key: median(id, neighbours) }));

      ranks[index] = keyed
        .map((entry, position) => ({ ...entry, position }))
        .sort((a, b) => {
          // A node with no neighbours in the reference rank keeps where it was.
          const ka = a.key < 0 ? a.position : a.key;
          const kb = b.key < 0 ? b.position : b.key;
          if (ka !== kb) return ka - kb;
          return (indexOf.get(a.id) ?? 0) - (indexOf.get(b.id) ?? 0);
        })
        .map((entry) => entry.id);
    }
    readPositions();
  }
}

/**
 * Runs the whole pipeline.
 *
 * @param nodes measured boxes, in pixels
 * @param edges connections between them
 */
export function layered(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions,
): Placed {
  const flowing = nodes.filter((node) => node.x === undefined || node.y === undefined);
  const pinned = nodes.filter((node) => node.x !== undefined && node.y !== undefined);

  if (flowing.length === 0) {
    return finish(
      nodes.map((node, i) => ({ ...node, x: node.x ?? 0, y: node.y ?? 0, rank: 0, order: i })),
      edges.map((edge) => ({ ...edge, waypoints: [], reversed: false })),
      options,
    );
  }

  const reversed = breakCycles(flowing, edges);
  const { rank, forward } = assignRanks(flowing, edges, reversed);

  const indexOf = new Map(flowing.map((node, i) => [node.id, i] as const));
  const rankCount = Math.max(...flowing.map((node) => rank.get(node.id) ?? 0)) + 1;

  // Build the ranks in input order, so the starting point is stable.
  const ranks: string[][] = Array.from({ length: rankCount }, () => []);
  flowing.forEach((node) => ranks[rank.get(node.id) ?? 0].push(node.id));

  // A waypoint per rank an edge passes through without stopping. Without these, an edge
  // spanning three ranks is drawn straight through whatever sits in the rank between.
  const dummies: Dummy[] = [];
  forward.forEach((edge) => {
    const from = rank.get(edge.from) ?? 0;
    const to = rank.get(edge.to) ?? 0;
    for (let r = from + 1; r < to; r++) {
      const id = ` dummy-${edge.edge}-${r}`;
      ranks[r].push(id);
      dummies.push({ id, rank: r, order: 0, x: 0, width: 1, height: 1, edge: edge.edge });
      indexOf.set(id, flowing.length + dummies.length);
    }
  });

  // Dummies participate in ordering so real nodes make room for the edges passing them.
  const throughEdges: Ranked["forward"] = [];
  forward.forEach((edge) => {
    const from = rank.get(edge.from) ?? 0;
    const to = rank.get(edge.to) ?? 0;
    if (to - from <= 1) {
      throughEdges.push(edge);
      return;
    }
    let previous = edge.from;
    for (let r = from + 1; r < to; r++) {
      const id = ` dummy-${edge.edge}-${r}`;
      throughEdges.push({ from: previous, to: id, edge: edge.edge, reversed: edge.reversed });
      previous = id;
    }
    throughEdges.push({ from: previous, to: edge.to, edge: edge.edge, reversed: edge.reversed });
  });

  reduceCrossings(ranks, throughEdges, indexOf);

  // ---- coordinates ----------------------------------------------------------
  const sizeOf = new Map<string, { width: number; height: number }>();
  flowing.forEach((node) => sizeOf.set(node.id, { width: node.width, height: node.height }));
  dummies.forEach((dummy) => sizeOf.set(dummy.id, { width: dummy.width, height: dummy.height }));

  // Cross-axis: lay each rank out end to end, then pull nodes toward their neighbours.
  const across = new Map<string, number>();
  ranks.forEach((ids) => {
    let cursor = 0;
    ids.forEach((id) => {
      const size = sizeOf.get(id)!;
      across.set(id, cursor + size.width / 2);
      cursor += size.width + options.nodeGap;
    });
  });

  const neighboursOf = new Map<string, string[]>();
  throughEdges.forEach((edge) => {
    if (!neighboursOf.has(edge.from)) neighboursOf.set(edge.from, []);
    if (!neighboursOf.has(edge.to)) neighboursOf.set(edge.to, []);
    neighboursOf.get(edge.from)!.push(edge.to);
    neighboursOf.get(edge.to)!.push(edge.from);
  });

  for (let pass = 0; pass < 4; pass++) {
    for (const ids of ranks) {
      // Desired centre from the neighbours, then push apart to restore the gap.
      const wanted = ids.map((id) => {
        const neighbours = neighboursOf.get(id) ?? [];
        if (neighbours.length === 0) return across.get(id)!;
        const sum = neighbours.reduce((total, other) => total + (across.get(other) ?? 0), 0);
        return sum / neighbours.length;
      });

      const sorted = ids
        .map((id, i) => ({ id, want: wanted[i], width: sizeOf.get(id)!.width }))
        .sort((a, b) => a.want - b.want || (indexOf.get(a.id) ?? 0) - (indexOf.get(b.id) ?? 0));

      let edge = -Infinity;
      for (const entry of sorted) {
        const half = entry.width / 2;
        const centre = Math.max(entry.want, edge + options.nodeGap + half);
        across.set(entry.id, centre);
        edge = centre + half;
      }
    }
  }

  // Normalise so the leftmost node sits at zero.
  const minAcross = Math.min(
    ...[...across.entries()].map(([id, centre]) => centre - sizeOf.get(id)!.width / 2),
  );
  across.forEach((value, id) => across.set(id, value - minAcross));

  // Along the flow: each rank starts below the tallest node of the one before.
  const rankOffset: number[] = [];
  let along = 0;
  ranks.forEach((ids, index) => {
    rankOffset[index] = along;
    const tallest = Math.max(0, ...ids.map((id) => sizeOf.get(id)!.height));
    along += tallest + options.rankGap;
  });
  const alongTotal = Math.max(0, along - options.rankGap);
  const acrossTotal = Math.max(
    0,
    ...[...across.entries()].map(([id, centre]) => centre + sizeOf.get(id)!.width / 2),
  );

  const placedFlowing: PlacedNode[] = flowing.map((node) => {
    const r = rank.get(node.id) ?? 0;
    const ids = ranks[r];
    const tallest = Math.max(0, ...ids.map((id) => sizeOf.get(id)!.height));
    return {
      ...node,
      rank: r,
      order: ids.indexOf(node.id),
      x: across.get(node.id)! - node.width / 2,
      // Centre each node in its rank's band, so a tall decision does not shove its row down.
      y: rankOffset[r] + (tallest - node.height) / 2,
    };
  });

  const dummyAt = new Map<string, [number, number]>();
  dummies.forEach((dummy) => {
    const ids = ranks[dummy.rank];
    const tallest = Math.max(0, ...ids.map((id) => sizeOf.get(id)!.height));
    dummyAt.set(dummy.id, [across.get(dummy.id)!, rankOffset[dummy.rank] + tallest / 2]);
  });

  const placedEdges: PlacedEdge[] = edges.map((edge, index) => {
    const routed = forward.find((f) => f.edge === index);
    const waypoints: Array<[number, number]> = [];
    if (routed) {
      const from = rank.get(routed.from) ?? 0;
      const to = rank.get(routed.to) ?? 0;
      for (let r = from + 1; r < to; r++) {
        const at = dummyAt.get(` dummy-${index}-${r}`);
        if (at) waypoints.push(at);
      }
      // Waypoints are collected down the ranks; a reversed edge is drawn the other way.
      if (routed.reversed) waypoints.reverse();
    }
    return { ...edge, waypoints, reversed: routed?.reversed ?? false };
  });

  const all = [...placedFlowing, ...pinned.map((node, i) => ({
    ...node,
    x: node.x!,
    y: node.y!,
    rank: -1,
    order: i,
  }))];

  return finish(all, placedEdges, options, { along: alongTotal, across: acrossTotal });
}

/**
 * Applies the direction and reports the diagram's size.
 *
 * "Down" is what the pipeline solved; the rest are reflections and a transpose of the
 * finished coordinates.
 */
function finish(
  nodes: PlacedNode[],
  edges: PlacedEdge[],
  options: LayoutOptions,
  span?: { along: number; across: number },
): Placed {
  const alongTotal = span?.along ?? Math.max(0, ...nodes.map((n) => n.y + n.height));
  const acrossTotal = span?.across ?? Math.max(0, ...nodes.map((n) => n.x + n.width));

  const transform = (x: number, y: number, _w: number, h: number): [number, number] => {
    switch (options.direction) {
      case "Up":
        return [x, alongTotal - y - h];
      case "Right":
        return [y, x];
      case "Left":
        return [alongTotal - y - h, x];
      case "Down":
      default:
        return [x, y];
    }
  };

  const movedNodes = nodes.map((node) => {
    const [x, y] = transform(node.x, node.y, node.width, node.height);
    return { ...node, x, y };
  });

  const movedEdges = edges.map((edge) => ({
    ...edge,
    waypoints: edge.waypoints.map(([x, y]) => {
      const [nx, ny] = transform(x, y, 0, 0);
      return [nx, ny] as [number, number];
    }),
  }));

  const horizontal = options.direction === "Right" || options.direction === "Left";

  return {
    nodes: movedNodes,
    edges: movedEdges,
    width: horizontal ? alongTotal : acrossTotal,
    height: horizontal ? acrossTotal : alongTotal,
  };
}

/** Re-exported so callers need only one import. */
export type { EdgeStyle, FlowDirection, LayoutOptions, Placed };
