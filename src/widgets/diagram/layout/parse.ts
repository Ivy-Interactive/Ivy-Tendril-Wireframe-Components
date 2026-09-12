/**
 * The text form of a chart.
 *
 * A deliberate subset of Mermaid's flowchart syntax. We own the parser and therefore the
 * semantics; what we decline to own is a *new spelling* for something every agent can
 * already write from memory. Anything outside the subset is an error with a line number,
 * never a silent drop — a chart quietly missing an edge is worse than one that says why.
 */
import type { FlowShape } from "../shapes";

export interface ParsedNode {
  id: string;
  label?: string;
  shape?: FlowShape;
}

export interface ParsedEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  headless?: boolean;
}

export interface ParseProblem {
  /** 1-based, so it matches what an editor shows. */
  line: number;
  text: string;
  message: string;
}

export interface ParsedChart {
  nodes: ParsedNode[];
  edges: ParsedEdge[];
  problems: ParseProblem[];
}

/**
 * Bracket pairs, longest first: `([` has to be tried before `(`, or a terminator parses as a
 * rounded process with a stray bracket in its label.
 */
const WRAPPERS: Array<{ open: string; close: string; shape: FlowShape }> = [
  { open: "([", close: "])", shape: "Terminator" },
  { open: "[(", close: ")]", shape: "Database" },
  { open: "[/", close: "/]", shape: "InputOutput" },
  { open: "[\\", close: "\\]", shape: "Manual" },
  { open: "[[", close: "]]", shape: "Preparation" },
  { open: "((", close: "))", shape: "Connector" },
  { open: "{", close: "}", shape: "Decision" },
  { open: "[", close: "]", shape: "Process" },
  { open: "(", close: ")", shape: "Process" },
];

/** `Check{Valid?}` → the node, and how much of the text it used. */
function readNode(text: string, from: number): { node: ParsedNode; end: number } | null {
  let i = from;
  while (i < text.length && /\s/.test(text[i])) i++;

  // No hyphens in ids, deliberately: `A-->B` with no spaces is legal Mermaid, and an id
  // charset that includes `-` reads it as an id of "A--".
  const idStart = i;
  while (i < text.length && /[A-Za-z0-9_.]/.test(text[i])) i++;
  if (i === idStart) return null;

  const id = text.slice(idStart, i);
  const wrapper = WRAPPERS.find((candidate) => text.startsWith(candidate.open, i));
  if (!wrapper) return { node: { id }, end: i };

  const close = text.indexOf(wrapper.close, i + wrapper.open.length);
  if (close < 0) return null; // unterminated; the caller reports it against the line

  return {
    node: {
      id,
      label: text.slice(i + wrapper.open.length, close).trim(),
      shape: wrapper.shape,
    },
    end: close + wrapper.close.length,
  };
}

/**
 * The arrow between two nodes.
 *
 * Written out form by form rather than as one clever pattern. The forms differ in ways a
 * combined regex hides — `---` is headless but `--->` is not, and a label can arrive either
 * inside the arrow or in pipes after it — and a pattern that gets one of those subtly wrong
 * fails by dropping edges, silently, which is the one outcome worth this much plainness.
 *
 * Order matters: the longest and most specific first, so `-->` is never read as `--`.
 */
function readArrow(text: string, from: number) {
  const rest = text.slice(from);

  const forms: Array<{
    pattern: RegExp;
    dashed?: boolean;
    headless?: boolean;
    labelled?: boolean;
  }> = [
    { pattern: /^\s*--\s+(.+?)\s+-+>/, labelled: true },          // -- yes -->
    { pattern: /^\s*-\.\s*(.+?)\s*\.-*>/, labelled: true, dashed: true }, // -. no .->
    { pattern: /^\s*==\s+(.+?)\s+=+>/, labelled: true },          // == yes ==>
    { pattern: /^\s*-\.-*>/, dashed: true },                       // -.->
    { pattern: /^\s*-{2,}>/ },                                     // --> --->
    { pattern: /^\s*={2,}>/ },                                     // ==>
    { pattern: /^\s*-\.-+(?!>)/, dashed: true, headless: true },    // -.-
    { pattern: /^\s*-{3,}(?!>)/, headless: true },                  // ---
  ];

  for (const form of forms) {
    const match = form.pattern.exec(rest);
    if (!match) continue;

    let end = from + match[0].length;
    let label = form.labelled ? match[1].trim() : undefined;

    // Mermaid also allows the label after the arrow: `A -->|yes| B`.
    if (!form.labelled) {
      const piped = /^\s*\|\s*([^|]*?)\s*\|/.exec(text.slice(end));
      if (piped) {
        label = piped[1].trim();
        end += piped[0].length;
      }
    }

    return {
      end,
      label: label && label.length > 0 ? label : undefined,
      dashed: form.dashed ?? false,
      headless: form.headless ?? false,
    };
  }

  return null;
}

/**
 * Parses the text form.
 *
 * Blank lines and `%%` comments are skipped. A `direction TD` line is accepted and ignored —
 * the prop is the one that decides, so that a chart pasted from elsewhere does not silently
 * override it.
 */
export function parseChart(source: string): ParsedChart {
  const nodes = new Map<string, ParsedNode>();
  const edges: ParsedEdge[] = [];
  const problems: ParseProblem[] = [];

  const remember = (node: ParsedNode) => {
    const existing = nodes.get(node.id);
    if (!existing) {
      nodes.set(node.id, node);
      return;
    }
    // A later mention with a label or shape fills in what the first one left out.
    if (node.label !== undefined) existing.label = node.label;
    if (node.shape !== undefined) existing.shape = node.shape;
  };

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith("%%")) return;
    if (/^(graph|flowchart|direction)\b/i.test(line)) return;

    const first = readNode(line, 0);
    if (!first) {
      problems.push({
        line: index + 1,
        text: line,
        message: "Expected a node id, optionally followed by a label in brackets.",
      });
      return;
    }
    remember(first.node);

    let cursor = first.end;
    let previous = first.node.id;
    let sawArrow = false;

    // `A --> B --> C` on one line is a chain, which is how these are written by hand.
    while (cursor < line.length) {
      const arrow = readArrow(line, cursor);
      if (!arrow) break;

      const next = readNode(line, arrow.end);
      if (!next) {
        problems.push({
          line: index + 1,
          text: line,
          message: "An arrow needs a node after it.",
        });
        return;
      }

      remember(next.node);
      edges.push({
        from: previous,
        to: next.node.id,
        label: arrow.label,
        dashed: arrow.dashed || undefined,
        headless: arrow.headless || undefined,
      });

      previous = next.node.id;
      cursor = next.end;
      sawArrow = true;
    }

    const trailing = line.slice(cursor).trim();
    if (trailing.length > 0) {
      problems.push({
        line: index + 1,
        text: line,
        message: `Did not understand "${trailing}".`,
      });
      return;
    }

    if (!sawArrow && first.node.label === undefined && first.node.shape === undefined) {
      problems.push({
        line: index + 1,
        text: line,
        message: "A node on its own needs a label, or an arrow to something.",
      });
    }
  });

  return { nodes: [...nodes.values()], edges, problems };
}
