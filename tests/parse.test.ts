/**
 * The text form.
 *
 * The parser's job is not only to read the subset but to *refuse the rest loudly*. An agent
 * cannot see a console, so a line it got wrong has to come back as a problem with a line
 * number, never as a chart quietly missing an edge.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseChart } from "../src/widgets/diagram/layout/parse.ts";

test("a plain edge gives two nodes and one connection", () => {
  const { nodes, edges, problems } = parseChart("A --> B");

  assert.deepEqual(problems, []);
  assert.deepEqual(nodes.map((n) => n.id), ["A", "B"]);
  assert.equal(edges.length, 1);
  assert.deepEqual({ from: edges[0].from, to: edges[0].to }, { from: "A", to: "B" });
});

test("an edge with no spaces around it still parses", () => {
  // `A-->B` is legal Mermaid, and an id charset containing "-" would read the id as "A--".
  const { nodes, edges, problems } = parseChart("A-->B");

  assert.deepEqual(problems, []);
  assert.deepEqual(nodes.map((n) => n.id), ["A", "B"]);
  assert.equal(edges.length, 1);
});

test("brackets choose the shape", () => {
  const { nodes } = parseChart(`
    Start([Go]) --> Step[Work]
    Step --> Ask{Sure?}
    Ask --> Store[(Records)]
    Store --> Read[/Input/]
    Read --> Prep[[Set up]]
    Prep --> Hop((A))
  `);

  const shapeOf = (id: string) => nodes.find((n) => n.id === id)?.shape;

  assert.equal(shapeOf("Start"), "Terminator");
  assert.equal(shapeOf("Step"), "Process");
  assert.equal(shapeOf("Ask"), "Decision");
  assert.equal(shapeOf("Store"), "Database");
  assert.equal(shapeOf("Read"), "InputOutput");
  assert.equal(shapeOf("Prep"), "Preparation");
  assert.equal(shapeOf("Hop"), "Connector");
});

test("a label given later fills in a node mentioned earlier", () => {
  const { nodes } = parseChart("A --> B\nB[Named later]");

  assert.equal(nodes.find((n) => n.id === "B")?.label, "Named later");
});

test("an edge label is read in both of Mermaid's forms", () => {
  const inline = parseChart("A -- yes --> B");
  const piped = parseChart("A -->|no| B");

  assert.equal(inline.edges[0].label, "yes");
  assert.equal(piped.edges[0].label, "no");
  assert.deepEqual([...inline.problems, ...piped.problems], []);
});

test("dashed and headless arrows are distinguished from plain ones", () => {
  const { edges, problems } = parseChart("A -.-> B\nB --- C\nC --> D");

  assert.deepEqual(problems, []);
  assert.equal(edges[0].dashed, true);
  assert.equal(edges[1].headless, true);
  assert.equal(edges[2].dashed, undefined);
  assert.equal(edges[2].headless, undefined);
});

test("a dashed arrow with a label keeps both", () => {
  const { edges, problems } = parseChart("A -. maybe .-> B");

  assert.deepEqual(problems, []);
  assert.equal(edges[0].label, "maybe");
  assert.equal(edges[0].dashed, true);
});

test("a chain on one line becomes a chain of edges", () => {
  const { nodes, edges } = parseChart("A --> B --> C --> D");

  assert.equal(nodes.length, 4);
  assert.deepEqual(
    edges.map((e) => `${e.from}${e.to}`),
    ["AB", "BC", "CD"],
  );
});

test("comments, blank lines and a direction header are skipped", () => {
  const { nodes, edges, problems } = parseChart(`
    %% the happy path
    flowchart TD
    direction TD

    A --> B
  `);

  assert.deepEqual(problems, []);
  assert.equal(nodes.length, 2);
  assert.equal(edges.length, 1);
});

test("a line it cannot read is reported with its number, not dropped", () => {
  const { problems } = parseChart("A --> B\n!!! nonsense\nB --> C");

  assert.equal(problems.length, 1);
  assert.equal(problems[0].line, 2);
  assert.match(problems[0].message, /node id/i);
});

test("the readable lines still parse when one line is bad", () => {
  // Half a chart beats no chart — the panel says what was lost.
  const { edges, problems } = parseChart("A --> B\n@@@\nB --> C");

  assert.equal(problems.length, 1);
  assert.deepEqual(edges.map((e) => `${e.from}${e.to}`), ["AB", "BC"]);
});

test("an arrow with nothing after it is an error", () => {
  const { problems } = parseChart("A -->");

  assert.equal(problems.length, 1);
  assert.match(problems[0].message, /needs a node/i);
});

test("an unterminated bracket is an error rather than a swallowed label", () => {
  const { problems } = parseChart("A[Unclosed --> B");

  assert.equal(problems.length, 1);
  assert.equal(problems[0].line, 1);
});

test("trailing rubbish after a good edge is reported", () => {
  const { problems } = parseChart("A --> B ???");

  assert.equal(problems.length, 1);
  assert.match(problems[0].message, /did not understand/i);
});

test("a bare node with no label and no arrow is an error", () => {
  // Almost always a typo — a lone identifier does nothing and would vanish silently.
  const { problems } = parseChart("Orphan");

  assert.equal(problems.length, 1);
});

test("a bare node with a label is fine on its own", () => {
  const { nodes, problems } = parseChart("Solo[On its own]");

  assert.deepEqual(problems, []);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].label, "On its own");
});

test("the worked example from the plan parses exactly as written", () => {
  const { nodes, edges, problems } = parseChart(`
    Start([Start]) --> Check{Valid?}
    Check -- yes --> Save[Save record]
    Check -- no --> Start
    Save --> Done([Done])
  `);

  assert.deepEqual(problems, []);
  assert.deepEqual(nodes.map((n) => n.id), ["Start", "Check", "Save", "Done"]);
  assert.equal(nodes.find((n) => n.id === "Check")?.shape, "Decision");
  assert.equal(edges.length, 4);
  assert.equal(edges[1].label, "yes");
  assert.equal(edges[2].label, "no");
  assert.deepEqual({ from: edges[2].from, to: edges[2].to }, { from: "Check", to: "Start" });
});
