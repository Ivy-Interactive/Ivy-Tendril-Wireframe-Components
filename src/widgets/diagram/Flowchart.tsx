import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { Sizing, WidgetBaseProps } from "@/lib/types";
import { INK, INK_MUTED, PAPER, resolveColor, seriesColor, tint, STROKE, type ColorScheme } from "@/sketch/colors";
import { barbsAt, handRng, type Pt } from "@/sketch/hand";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import type { ArrowHeads } from "@/widgets/wireframe/Arrow";
import { measureLabel, whenFontReady, type MeasuredLabel } from "./measure";
import { labelBox, shapeOutline, SHAPE_PADDING, type FlowShape, type Rect } from "./shapes";
import { layered } from "./layout/layered";
import { parseChart, type ParseProblem } from "./layout/parse";
import { routeEdges } from "./layout/route";
import type { EdgeStyle, FlowDirection, LayoutEdge, LayoutNode } from "./layout/types";

export type { FlowShape } from "./shapes";
export type { EdgeStyle, FlowDirection } from "./layout/types";

/** A box in the chart. */
export interface FlowchartNode {
  /** Referenced by edges. Must be unique. */
  id: string;
  /** Text inside the box. Falls back to the id, so a bare `{ id: "Start" }` still reads. */
  label?: string;
  /**
   * Which flowchart symbol to draw.
   * @default "Process"
   */
  shape?: FlowShape;
  /** A lucide icon name, drawn before the label. */
  icon?: string;
  /** Ivy colour name or CSS colour for the outline and wash. */
  color?: string;
  /** Fixes the box size instead of measuring the label. */
  width?: Sizing;
  height?: Sizing;
  /** Pins the node at this position and takes it out of the automatic layout. */
  x?: Sizing;
  y?: Sizing;
}

/** A connection between two boxes. */
export interface FlowchartEdge {
  /** Id of the node the arrow leaves. */
  from: string;
  /** Id of the node the arrow points at. */
  to: string;
  /** Text on the line — the branch condition, usually. */
  label?: string;
  /** Draws the line dashed, for a weak or optional step. */
  dashed?: boolean;
  /**
   * Which end carries an arrowhead.
   * @default "End"
   */
  heads?: ArrowHeads;
  /** Ivy colour name or CSS colour for the line. */
  color?: string;
}

export interface FlowchartProps extends WidgetBaseProps {
  /** The boxes. Ignored when `chart` is given. */
  nodes?: FlowchartNode[];
  /** The arrows. Ignored when `chart` is given. */
  edges?: FlowchartEdge[];
  /**
   * The chart in text form, as a subset of Mermaid's flowchart syntax:
   * `Start([Start]) --> Check{Valid?}` and `Check -- yes --> Save[Save]`.
   * Brackets pick the shape, arrows pick the edge. Takes precedence over `nodes`.
   */
  chart?: string;
  /**
   * Which way the flow runs.
   * @default "Down"
   */
  direction?: FlowDirection;
  /**
   * How the arrows get between boxes.
   * @default "Elbow"
   */
  edgeStyle?: EdgeStyle;
  /** Gap between neighbours in the same rank. */
  nodeGap?: number;
  /** Gap between one rank and the next. */
  rankGap?: number;
  /**
   * Colours the nodes in sequence rather than leaving them all ink.
   * @default "Default"
   */
  colorScheme?: ColorScheme;
  onNodeClick?: (id: string) => void;
}

/** How wide a label may run before it wraps. */
const MAX_LABEL_WIDTH = 170;

/**
 * Rounds a measurement up to a 4px grid.
 *
 * Text metrics are fractional, and a node sized straight from one would change by a pixel
 * between runs and break `screenshot --repeat`. A grid does not remove that risk on its own
 * — it moves the boundary — so it works together with waiting for the real font below,
 * which is what stops the underlying number moving in the first place.
 */
const snap = (value: number) => Math.ceil(value / 4) * 4;

const DEFAULT_SHAPE: FlowShape = "Process";

/** Turns a `Sizing` into pixels, for the few places the layout needs a number. */
function pixels(value: Sizing | undefined): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return value * 4;
  const trimmed = String(value).trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed) * 4;
  if (trimmed.endsWith("px")) return Number.parseFloat(trimmed);
  if (trimmed.endsWith("rem")) return Number.parseFloat(trimmed) * 16;
  return undefined;
}

/**
 * A flowchart, laid out automatically and drawn in the sketch hand.
 * Mirrors no single Ivy widget; it is the diagram the wireframe set was missing.
 *
 * Give it `nodes` and `edges`, or write the whole chart in `chart` using a subset of
 * Mermaid's syntax. Boxes size themselves to their labels, ranks fall out of the arrows,
 * and long edges route around whatever is in the way.
 *
 * @category Diagrams
 * @tags flowchart diagram graph process decision workflow
 * @example <Flowchart chart="Start([Start]) --> Check{Valid?}" />
 * @example <Flowchart chart={`
 *   Start([Start]) --> Check{Valid?}
 *   Check -- yes --> Save[Save record]
 *   Check -- no --> Start
 * `} />
 * @example <Flowchart direction="Right" nodes={[{ id: "a", label: "Draft" }, { id: "b", label: "Review" }]} edges={[{ from: "a", to: "b" }]} />
 */
export const Flowchart = ({
  id,
  nodes,
  edges,
  chart,
  direction = "Down",
  edgeStyle = "Elbow",
  nodeGap,
  rankGap,
  colorScheme = "Default",
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onNodeClick,
  ...rest
}: FlowchartProps) => {
  const chartId = id ?? "flowchart";
  const strokeWidth = byDensity(density, [STROKE.thin, STROKE.regular, STROKE.emphasis]);
  const fontSize = byDensity(density, [11, 12.5, 14]);
  const headSize = byDensity(density, [9, 11, 13]);
  const gapWithin = nodeGap ?? byDensity(density, [26, 34, 44]);
  const gapBetween = rankGap ?? byDensity(density, [34, 46, 58]);

  // ---- the graph, from either form ----------------------------------------
  const { graphNodes, graphEdges, problems } = React.useMemo(() => {
    if (chart !== undefined) {
      const parsed = parseChart(chart);
      return {
        graphNodes: parsed.nodes.map<FlowchartNode>((node) => ({
          id: node.id,
          label: node.label ?? node.id,
          shape: node.shape,
        })),
        graphEdges: parsed.edges.map<FlowchartEdge>((edge) => ({
          from: edge.from,
          to: edge.to,
          label: edge.label,
          dashed: edge.dashed,
          heads: edge.headless ? "None" : "End",
        })),
        problems: parsed.problems,
      };
    }
    return {
      graphNodes: nodes ?? [],
      graphEdges: edges ?? [],
      problems: [] as ParseProblem[],
    };
  }, [chart, nodes, edges]);

  // ---- label sizes ---------------------------------------------------------
  // Measured with canvas metrics rather than a hidden DOM node. See measure.ts: a DOM
  // measurement wobbled by a fraction of a pixel between runs, which was enough to resize a
  // box and break the byte-for-byte screenshot comparison.
  //
  // The only asynchrony left is the webfont: until it is loaded the metrics describe the
  // fallback, so this re-renders once when it arrives. The screenshot pipeline already waits
  // for fonts and then for a quiet period, so it never captures the interim layout.
  const [fontReady, setFontReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    whenFontReady(fontSize)
      .then(() => {
        if (!cancelled) setFontReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontReady(true); // no font API; the fallback metrics are what we have
      });
    return () => {
      cancelled = true;
    };
  }, [fontSize]);

  const measured = React.useMemo(() => {
    const sizes: Record<string, MeasuredLabel> = {};
    graphNodes.forEach((node) => {
      sizes[node.id] = measureLabel(node.label ?? node.id, fontSize, MAX_LABEL_WIDTH);
    });
    return sizes;
    // fontReady is a dependency on purpose: the same text measures differently once the
    // real face is in, and every box has to be resized when it is.
  }, [graphNodes, fontSize, fontReady]);

  // ---- pass B: lay it out ---------------------------------------------------
  const diagram = React.useMemo(() => {
    if (graphNodes.length === 0) return null;

    const shapeOf = new Map<string, FlowShape>();
    graphNodes.forEach((node) => shapeOf.set(node.id, node.shape ?? DEFAULT_SHAPE));

    const layoutNodes: LayoutNode[] = graphNodes.map((node) => {
      const shape = node.shape ?? DEFAULT_SHAPE;
      const padding = SHAPE_PADDING[shape] ?? SHAPE_PADDING.Process;
      const label = measured[node.id] ?? { width: 64, height: fontSize * 1.4, lines: [] };
      // Snapped to a 4px grid. The metrics are stable now, but a grid keeps a one-glyph
      // edit from nudging the whole chart, which makes diffs between screenshots readable.
      const icon = node.icon ? fontSize + 8 : 0;
      return {
        id: node.id,
        width: pixels(node.width) ?? Math.max(56, snap(label.width + icon + padding.x)),
        height: pixels(node.height) ?? Math.max(40, snap(label.height + padding.y)),
        x: pixels(node.x),
        y: pixels(node.y),
      };
    });

    const layoutEdges: LayoutEdge[] = graphEdges.map((edge) => ({ from: edge.from, to: edge.to }));

    const placed = layered(layoutNodes, layoutEdges, {
      direction,
      nodeGap: gapWithin,
      rankGap: gapBetween,
    });

    const routed = routeEdges(
      placed.nodes,
      placed.edges,
      (nodeId) => shapeOf.get(nodeId) ?? DEFAULT_SHAPE,
      direction,
      edgeStyle,
    );

    return { placed, routed, shapeOf };
  }, [graphNodes, graphEdges, measured, direction, edgeStyle, gapWithin, gapBetween, fontSize]);

  // A little room so a wobbling stroke and an arrowhead are not clipped at the edges.
  const bleed = 10;
  const diagramWidth = (diagram?.placed.width ?? 0) + bleed * 2;
  const diagramHeight = (diagram?.placed.height ?? 0) + bleed * 2;

  // Deliberately no shrink-to-fit. It was a feedback loop: the wrapper's width came from the
  // scale, the scale came from the measured width, and `diagram > host` is a hard threshold —
  // so a chart sized within a pixel of its container scaled on one run and not the next, and
  // `screenshot --repeat` caught it. A chart wider than its space overflows, the way every
  // other component here does; `direction="Right"` or an explicit `width` is the answer.

  const nodeById = new Map(graphNodes.map((node) => [node.id, node] as const));
  const colourOf = (nodeId: string, index: number) => {
    const declared = nodeById.get(nodeId)?.color;
    if (declared) return resolveColor(declared, INK);
    return colorScheme === "Default" ? INK : seriesColor(colorScheme, index);
  };

  return (
    <div
      id={id}
      className={cn("relative", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      {...rest}
    >
      {/* Pass A. Hidden, but laid out, so the browser does the wrapping for us. */}
      {problems.length > 0 && <ParsePanel problems={problems} />}

      {diagram && (
        <div style={{ width: diagramWidth, height: diagramHeight, position: "relative" }}>
          <div style={{ width: diagramWidth, height: diagramHeight, position: "relative" }}>
            <svg
              aria-hidden="true"
              className="absolute inset-0 overflow-visible"
              width={diagramWidth}
              height={diagramHeight}
            >
              <g transform={`translate(${bleed}, ${bleed})`}>
                {/* Edges first, so a node's wash covers where a line met its outline. */}
                {diagram.routed.map((route) => {
                  const edge = graphEdges[route.index];
                  const colour = resolveColor(edge?.color, INK_MUTED);
                  const heads = edge?.heads ?? "End";
                  const rnd = handRng(`${chartId}-head-${route.index}`);
                  const barbs: Array<[Pt, Pt]> = [];
                  if (heads === "End" || heads === "Both") {
                    barbs.push(...barbsAt(route.tip, route.from, headSize, rnd));
                  }
                  if (heads === "Start" || heads === "Both") {
                    barbs.push(
                      ...barbsAt(route.points[0], route.points[1] ?? route.tip, headSize, rnd),
                    );
                  }

                  return (
                    <g key={`edge-${route.index}`}>
                      <RoughShape
                        shape={
                          edgeStyle === "Curved"
                            ? { kind: "curve", points: route.points }
                            : { kind: "linearPath", points: route.points }
                        }
                        stroke={colour}
                        strokeWidth={strokeWidth}
                        seed={`${chartId}-edge-${route.index}`}
                        strokeLineDash={edge?.dashed ? [7, 5] : undefined}
                      />
                      {barbs.map((barb, i) => (
                        <RoughShape
                          key={i}
                          shape={{ kind: "line", x1: barb[0][0], y1: barb[0][1], x2: barb[1][0], y2: barb[1][1] }}
                          stroke={colour}
                          strokeWidth={strokeWidth}
                          seed={`${chartId}-barb-${route.index}-${i}`}
                        />
                      ))}
                      {edge?.label && (
                        <text
                          x={route.label[0]}
                          y={route.label[1] + 3}
                          textAnchor="middle"
                          fontSize={fontSize - 1.5}
                          fill={colour}
                          stroke={PAPER}
                          strokeWidth={3.5}
                          paintOrder="stroke"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {diagram.placed.nodes.map((node, index) => {
                  const shape = diagram.shapeOf.get(node.id) ?? DEFAULT_SHAPE;
                  const rect: Rect = { x: node.x, y: node.y, width: node.width, height: node.height };
                  const colour = colourOf(node.id, index);
                  const outline = shapeOutline(shape, rect);

                  return (
                    <RoughShape
                      key={`node-${node.id}`}
                      shape={{ kind: "polygon", points: outline }}
                      stroke={colour}
                      strokeWidth={strokeWidth}
                      fill={tint(colour, shape === "Note" ? 0.82 : 0.92)}
                      fillStyle="solid"
                      seed={`${chartId}-node-${node.id}`}
                      className={onNodeClick ? "cursor-pointer" : undefined}
                      onClick={onNodeClick ? () => onNodeClick(node.id) : undefined}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Labels as real HTML, positioned into the boxes the layout computed — the
                same trick Mockup uses to put content inside a drawn device frame. */}
            {diagram.placed.nodes.map((node, index) => {
              const source = nodeById.get(node.id);
              const shape = diagram.shapeOf.get(node.id) ?? DEFAULT_SHAPE;
              const box = labelBox(shape, {
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
              });
              return (
                <div
                  key={`label-${node.id}`}
                  className="pointer-events-none absolute flex items-center justify-center text-center"
                  style={{
                    left: box.x + bleed,
                    top: box.y + bleed,
                    width: box.width,
                    height: box.height,
                    fontSize,
                    lineHeight: 1.3,
                    color: colourOf(node.id, index),
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {source?.icon && <Icon name={source.icon} size={fontSize + 2} color={colourOf(node.id, index)} />}
                    {/* The measured lines, not the original string: letting CSS re-wrap it
                        would break the text somewhere other than where the box was sized
                        for. */}
                    <span>
                      {(measured[node.id]?.lines ?? [source?.label ?? node.id]).map((line, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <br />}
                          {line}
                        </React.Fragment>
                      ))}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * What went wrong with the text form.
 *
 * Rendered rather than thrown: a chart that silently loses an edge is the failure this
 * whole toolchain is built to avoid, and an agent cannot see a console.
 */
const ParsePanel = ({ problems }: { problems: ParseProblem[] }) => (
  <div
    className="mb-3 border-l-2 px-3 py-2 text-[12px] leading-relaxed"
    style={{ borderColor: resolveColor("Destructive"), background: tint(resolveColor("Destructive"), 0.92) }}
  >
    <p className="m-0 font-bold" style={{ color: resolveColor("Destructive") }}>
      {problems.length === 1 ? "1 line was not understood" : `${problems.length} lines were not understood`}
    </p>
    <ul className="m-0 mt-1 list-none p-0">
      {problems.slice(0, 6).map((problem) => (
        <li key={problem.line} style={{ color: INK_MUTED }}>
          <span className="font-mono">line {problem.line}</span> — {problem.message}{" "}
          <span className="font-mono opacity-70">{problem.text.slice(0, 48)}</span>
        </li>
      ))}
    </ul>
  </div>
);
