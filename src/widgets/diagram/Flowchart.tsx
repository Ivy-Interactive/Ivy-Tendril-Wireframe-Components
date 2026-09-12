import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { Sizing, WidgetBaseProps } from "@/lib/types";
import { INK, INK_MUTED, PAPER, resolveColor, seriesColor, tint, STROKE, type ColorScheme } from "@/sketch/colors";
import { barbsAt, handRng, type Pt } from "@/sketch/hand";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";
import type { ArrowHeads } from "@/widgets/wireframe/Arrow";
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

interface Measured {
  width: number;
  height: number;
}

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

  // ---- pass A: measure the labels ------------------------------------------
  // Nothing else in the library measures text, and a node has to fit its own label. The
  // labels render hidden, a ResizeObserver reports their natural boxes, and the layout runs
  // on the result. A one-shot measurement would be taken before the webfont loads and bake
  // fallback metrics into every box; this re-measures when the font arrives.
  const [measured, setMeasured] = React.useState<Record<string, Measured>>({});
  const probeRef = React.useRef<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const host = probeRef.current;
    if (!host) return;

    const read = () => {
      const next: Record<string, Measured> = {};
      host.querySelectorAll<HTMLElement>("[data-node]").forEach((element) => {
        const key = element.dataset.node!;
        const rect = element.getBoundingClientRect();
        next[key] = { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
      });

      setMeasured((previous) => {
        const keys = Object.keys(next);
        const same =
          keys.length === Object.keys(previous).length &&
          keys.every(
            (key) =>
              previous[key] &&
              Math.abs(previous[key].width - next[key].width) < 0.5 &&
              Math.abs(previous[key].height - next[key].height) < 0.5,
          );
        return same ? previous : next;
      });
    };

    read();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(read);
    host.querySelectorAll<HTMLElement>("[data-node]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [graphNodes, fontSize]);

  // ---- pass B: lay it out ---------------------------------------------------
  const diagram = React.useMemo(() => {
    if (graphNodes.length === 0) return null;

    const shapeOf = new Map<string, FlowShape>();
    graphNodes.forEach((node) => shapeOf.set(node.id, node.shape ?? DEFAULT_SHAPE));

    const layoutNodes: LayoutNode[] = graphNodes.map((node) => {
      const shape = node.shape ?? DEFAULT_SHAPE;
      const padding = SHAPE_PADDING[shape] ?? SHAPE_PADDING.Process;
      const label = measured[node.id] ?? { width: 64, height: fontSize * 1.4 };
      return {
        id: node.id,
        width: pixels(node.width) ?? Math.max(56, Math.ceil(label.width + padding.x)),
        height: pixels(node.height) ?? Math.max(40, Math.ceil(label.height + padding.y)),
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

  const { ref: hostRef, width: hostWidth } = useMeasuredSize<HTMLDivElement>();

  // A little room so a wobbling stroke and an arrowhead are not clipped at the edges.
  const bleed = 10;
  const diagramWidth = (diagram?.placed.width ?? 0) + bleed * 2;
  const diagramHeight = (diagram?.placed.height ?? 0) + bleed * 2;

  // Shrink to fit the available width. Never scale up: a two-box chart blown up to fill a
  // page looks like a mistake.
  const scale =
    hostWidth > 0 && diagramWidth > hostWidth ? Math.max(0.35, hostWidth / diagramWidth) : 1;

  const nodeById = new Map(graphNodes.map((node) => [node.id, node] as const));
  const colourOf = (nodeId: string, index: number) => {
    const declared = nodeById.get(nodeId)?.color;
    if (declared) return resolveColor(declared, INK);
    return colorScheme === "Default" ? INK : seriesColor(colorScheme, index);
  };

  return (
    <div
      id={id}
      ref={hostRef}
      className={cn("relative", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      {...rest}
    >
      {/* Pass A. Hidden, but laid out, so the browser does the wrapping for us. */}
      {/* Measured off to the side at its natural width. A zero-width or clipped container
          would make every label wrap at its narrowest, and the boxes would come out sized
          for one word per line. */}
      <div
        ref={probeRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: -10000, top: 0, visibility: "hidden" }}
      >
        {graphNodes.map((node) => (
          <div
            key={node.id}
            data-node={node.id}
            className="inline-flex items-center gap-1.5 whitespace-pre-wrap"
            style={{ fontSize, lineHeight: 1.3, maxWidth: 180 }}
          >
            {node.icon ? <span style={{ width: fontSize + 2, height: fontSize + 2 }} /> : null}
            {node.label ?? node.id}
          </div>
        ))}
      </div>

      {problems.length > 0 && <ParsePanel problems={problems} />}

      {diagram && (
        <div
          style={{
            width: diagramWidth * scale,
            height: diagramHeight * scale,
            position: "relative",
          }}
        >
          <div
            style={{
              width: diagramWidth,
              height: diagramHeight,
              transform: scale === 1 ? undefined : `scale(${scale})`,
              transformOrigin: "top left",
              position: "relative",
            }}
          >
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
                    {source?.label ?? node.id}
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
