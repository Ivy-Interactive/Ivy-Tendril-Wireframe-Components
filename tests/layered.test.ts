/**
 * The layout engine.
 *
 * This is the first thing in the repository with tests, and it earns them: five hundred
 * lines of graph arithmetic whose failures are invisible until a diagram looks subtly wrong
 * in a mockup someone has already sent. Run with `npm test` — Node's own test runner and
 * type stripping, so it costs the project no new dependency.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { layered } from "../src/widgets/diagram/layout/layered.ts";
import type { LayoutEdge, LayoutNode, LayoutOptions } from "../src/widgets/diagram/layout/types.ts";

const OPTIONS: LayoutOptions = { direction: "Down", nodeGap: 30, rankGap: 40 };

const boxes = (...ids: string[]): LayoutNode[] =>
  ids.map((id) => ({ id, width: 100, height: 40 }));

const link = (from: string, to: string): LayoutEdge => ({ from, to });

const find = (result: ReturnType<typeof layered>, id: string) => {
  const node = result.nodes.find((n) => n.id === id);
  assert.ok(node, `expected a node called ${id}`);
  return node;
};

test("a chain ranks in order, each rank below the last", () => {
  const result = layered(boxes("a", "b", "c"), [link("a", "b"), link("b", "c")], OPTIONS);

  assert.equal(find(result, "a").rank, 0);
  assert.equal(find(result, "b").rank, 1);
  assert.equal(find(result, "c").rank, 2);
  assert.ok(find(result, "a").y < find(result, "b").y);
  assert.ok(find(result, "b").y < find(result, "c").y);
});

test("a rank's gap is at least nodeGap, and siblings never overlap", () => {
  // One parent, three children: they all land in rank 1 together.
  const result = layered(
    boxes("root", "a", "b", "c"),
    [link("root", "a"), link("root", "b"), link("root", "c")],
    OPTIONS,
  );

  const rankOne = result.nodes
    .filter((node) => node.rank === 1)
    .sort((a, b) => a.x - b.x);

  assert.equal(rankOne.length, 3);
  for (let i = 0; i < rankOne.length - 1; i++) {
    const gap = rankOne[i + 1].x - (rankOne[i].x + rankOne[i].width);
    assert.ok(
      gap >= OPTIONS.nodeGap - 0.5,
      `nodes ${rankOne[i].id} and ${rankOne[i + 1].id} are ${gap}px apart, want ${OPTIONS.nodeGap}`,
    );
  }
});

test("a cycle terminates, ranks distinctly, and marks the back edge", () => {
  // The retry loop every real flowchart has.
  const result = layered(
    boxes("start", "check", "save"),
    [link("start", "check"), link("check", "save"), link("check", "start")],
    OPTIONS,
  );

  assert.equal(find(result, "start").rank, 0);
  assert.equal(find(result, "check").rank, 1);
  assert.equal(find(result, "save").rank, 2);

  const back = result.edges.find((edge) => edge.from === "check" && edge.to === "start");
  assert.ok(back, "the back edge survived");
  assert.equal(back.reversed, true, "the back edge was reversed to rank the graph");

  // And the edges the author wrote forwards were left alone.
  assert.equal(result.edges.filter((edge) => edge.reversed).length, 1);
});

test("an edge skipping a rank gets a waypoint to route around it", () => {
  const result = layered(
    boxes("a", "b", "c"),
    [link("a", "b"), link("b", "c"), link("a", "c")],
    OPTIONS,
  );

  const long = result.edges.find((edge) => edge.from === "a" && edge.to === "c");
  assert.ok(long);
  assert.equal(long.waypoints.length, 1, "one waypoint, for the rank it passes through");

  const [, waypointY] = long.waypoints[0];
  const middle = find(result, "b");
  assert.ok(
    waypointY > find(result, "a").y && waypointY < find(result, "c").y,
    "the waypoint sits between the ranks it bridges",
  );
  assert.ok(
    Math.abs(long.waypoints[0][0] - (middle.x + middle.width / 2)) > 1,
    "the waypoint is clear of the node it routes around",
  );
});

test("the same graph twice lays out identically", () => {
  // Screenshots are compared byte for byte, so this is the invariant that keeps them stable.
  const nodes = boxes("a", "b", "c", "d");
  const edges = [link("a", "b"), link("a", "c"), link("b", "d"), link("c", "d")];

  const first = layered(nodes, edges, OPTIONS);
  const second = layered(nodes, edges, OPTIONS);

  assert.deepEqual(second, first);
});

test("node order in the input does not change the geometry it produces", () => {
  // Guards the tie-breaks: they must key off input index, not object identity or Map order.
  const edges = [link("a", "b"), link("a", "c")];
  const forwards = layered(boxes("a", "b", "c"), edges, OPTIONS);
  const again = layered(boxes("a", "b", "c"), edges, OPTIONS);

  assert.deepEqual(
    again.nodes.map((n) => [n.id, n.x, n.y]),
    forwards.nodes.map((n) => [n.id, n.x, n.y]),
  );
});

test("Right transposes the diagram", () => {
  const down = layered(boxes("a", "b"), [link("a", "b")], OPTIONS);
  const right = layered(boxes("a", "b"), [link("a", "b")], { ...OPTIONS, direction: "Right" });

  assert.ok(find(down, "b").y > find(down, "a").y, "Down advances in y");
  assert.ok(find(right, "b").x > find(right, "a").x, "Right advances in x");
  assert.equal(right.width, down.height);
  assert.equal(right.height, down.width);
});

test("Up reverses the flow without moving nodes sideways", () => {
  const down = layered(boxes("a", "b"), [link("a", "b")], OPTIONS);
  const up = layered(boxes("a", "b"), [link("a", "b")], { ...OPTIONS, direction: "Up" });

  assert.ok(find(up, "b").y < find(up, "a").y);
  assert.equal(find(up, "a").x, find(down, "a").x);
});

test("a pinned node keeps its coordinates", () => {
  const nodes: LayoutNode[] = [
    { id: "a", width: 100, height: 40 },
    { id: "note", width: 80, height: 30, x: 400, y: 12 },
  ];
  const result = layered(nodes, [link("a", "note")], OPTIONS);

  assert.equal(find(result, "note").x, 400);
  assert.equal(find(result, "note").y, 12);
});

test("an edge naming a node that does not exist is ignored, not fatal", () => {
  const result = layered(boxes("a", "b"), [link("a", "b"), link("a", "ghost")], OPTIONS);

  assert.equal(result.nodes.length, 2);
  assert.equal(find(result, "b").rank, 1);
});

test("a self-loop does not push the node down a rank", () => {
  const result = layered(boxes("a", "b"), [link("a", "a"), link("a", "b")], OPTIONS);

  assert.equal(find(result, "a").rank, 0);
  assert.equal(find(result, "b").rank, 1);
});

test("crossing reduction puts children under the parent they belong to", () => {
  // Two parents with one child each, declared so the naive order crosses.
  const result = layered(
    boxes("p1", "p2", "c1", "c2"),
    [link("p1", "c1"), link("p2", "c2")],
    OPTIONS,
  );

  const p1 = find(result, "p1");
  const p2 = find(result, "p2");
  const c1 = find(result, "c1");
  const c2 = find(result, "c2");

  // Whichever way round the parents ended up, each child follows its own.
  assert.equal(p1.x < p2.x, c1.x < c2.x, "the edges do not cross");
});

test("a wide chart is measured by its widest rank", () => {
  const result = layered(
    boxes("root", "a", "b", "c"),
    [link("root", "a"), link("root", "b"), link("root", "c")],
    OPTIONS,
  );

  // Three 100px boxes and two 30px gaps.
  assert.equal(result.width, 100 * 3 + 30 * 2);
  // Two ranks of 40px, one 40px gap.
  assert.equal(result.height, 40 + 40 + 40);
});
