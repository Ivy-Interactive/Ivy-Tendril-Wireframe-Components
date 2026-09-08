import { STROKE, seriesColor } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { ChartShell } from "./ChartShell";
import type { BaseChartProps, ChordData, SankeyData } from "./types";

export type SankeyAlign = "Justify" | "Left";

export interface SankeyChartProps extends BaseChartProps {
  data?: SankeyData | null;
  nodeWidth?: number;
  nodeGap?: number;
  curvature?: number;
  nodeAlign?: SankeyAlign;
  layoutIterations?: number;
}

interface LayoutNode {
  index: number;
  name: string;
  depth: number;
  value: number;
  x: number;
  y: number;
  height: number;
}

/**
 * Assigns each node a column by longest path from a source, then stacks nodes
 * within a column in proportion to their throughput.
 */
function layoutSankey(
  data: SankeyData,
  width: number,
  height: number,
  nodeWidth: number,
  nodeGap: number,
  align: SankeyAlign,
): { nodes: LayoutNode[]; depthCount: number } {
  const count = data.nodes.length;
  const depths = new Array(count).fill(0);

  for (let pass = 0; pass < count; pass++) {
    let changed = false;
    data.links.forEach((link) => {
      if (depths[link.target] < depths[link.source] + 1) {
        depths[link.target] = depths[link.source] + 1;
        changed = true;
      }
    });
    if (!changed) break;
  }

  const depthCount = Math.max(1, Math.max(...depths) + 1);

  const throughput = data.nodes.map((_, index) => {
    const incoming = data.links
      .filter((link) => link.target === index)
      .reduce((sum, link) => sum + link.value, 0);
    const outgoing = data.links
      .filter((link) => link.source === index)
      .reduce((sum, link) => sum + link.value, 0);
    return Math.max(incoming, outgoing, 1);
  });

  const columns = new Map<number, number[]>();
  depths.forEach((depth, index) => {
    // "Justify" pushes sinks to the far edge; "Left" leaves them beside their source.
    const isSink = !data.links.some((link) => link.source === index);
    const column = align === "Justify" && isSink ? depthCount - 1 : depth;
    columns.set(column, [...(columns.get(column) ?? []), index]);
  });

  const columnGap = depthCount > 1 ? (width - nodeWidth) / (depthCount - 1) : 0;
  const nodes: LayoutNode[] = [];

  columns.forEach((indices, depth) => {
    const total = indices.reduce((sum, index) => sum + throughput[index], 0) || 1;
    const available = height - nodeGap * (indices.length - 1);
    let cursor = 0;
    indices.forEach((index) => {
      const nodeHeight = Math.max(4, (throughput[index] / total) * available);
      nodes.push({
        index,
        name: data.nodes[index]?.name ?? String(index),
        depth,
        value: throughput[index],
        x: depth * columnGap,
        y: cursor,
        height: nodeHeight,
      });
      cursor += nodeHeight + nodeGap;
    });
  });

  return { nodes, depthCount };
}

/** Mirrors `Ivy.SankeyChart`. */
export const SankeyChart = ({
  id,
  data,
  nodeWidth = 14,
  nodeGap = 10,
  curvature = 0.5,
  nodeAlign = "Justify",
  colorScheme,
  legend,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: SankeyChartProps) => {
  const entries = (data?.nodes ?? []).map((node, index) => ({
    name: node.name,
    color: seriesColor(colorScheme, index),
  }));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height ?? "20rem"}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        if (!data || data.nodes.length === 0) return null;
        const padding = 40;
        const plotWidth = w - padding * 2;
        const plotHeight = h - 20;
        const { nodes } = layoutSankey(data, plotWidth, plotHeight, nodeWidth, nodeGap, nodeAlign);
        const byIndex = new Map(nodes.map((node) => [node.index, node]));

        const sourceOffsets = new Map<number, number>();
        const targetOffsets = new Map<number, number>();

        return (
          <g transform={`translate(${padding}, 10)`}>
            {data.links.map((link, linkIndex) => {
              const source = byIndex.get(link.source);
              const target = byIndex.get(link.target);
              if (!source || !target) return null;

              const outTotal = data.links
                .filter((entry) => entry.source === link.source)
                .reduce((sum, entry) => sum + entry.value, 0) || 1;
              const inTotal = data.links
                .filter((entry) => entry.target === link.target)
                .reduce((sum, entry) => sum + entry.value, 0) || 1;

              const thickness = Math.max(1.5, (link.value / outTotal) * source.height);
              const targetThickness = Math.max(1.5, (link.value / inTotal) * target.height);

              const sourceY = source.y + (sourceOffsets.get(link.source) ?? 0) + thickness / 2;
              const targetY = target.y + (targetOffsets.get(link.target) ?? 0) + targetThickness / 2;
              sourceOffsets.set(link.source, (sourceOffsets.get(link.source) ?? 0) + thickness);
              targetOffsets.set(link.target, (targetOffsets.get(link.target) ?? 0) + targetThickness);

              const x1 = source.x + nodeWidth;
              const x2 = target.x;
              const controlX = (x2 - x1) * curvature;

              // A ribbon, not a fat stroke: two mirrored curves closed at each end.
              const topStart = sourceY - thickness / 2;
              const bottomStart = sourceY + thickness / 2;
              const topEnd = targetY - targetThickness / 2;
              const bottomEnd = targetY + targetThickness / 2;

              return (
                <RoughShape
                  key={linkIndex}
                  shape={{
                    kind: "path",
                    d: [
                      `M ${x1} ${topStart}`,
                      `C ${x1 + controlX} ${topStart}, ${x2 - controlX} ${topEnd}, ${x2} ${topEnd}`,
                      `L ${x2} ${bottomEnd}`,
                      `C ${x2 - controlX} ${bottomEnd}, ${x1 + controlX} ${bottomStart}, ${x1} ${bottomStart}`,
                      "Z",
                    ].join(" "),
                  }}
                  seed={`${id}-link-${linkIndex}`}
                  stroke="none"
                  fill={seriesColor(colorScheme, link.source)}
                  fillStyle="hachure"
                  fillWeight={0.5}
                  hachureGap={7}
                  hachureAngle={-45 + linkIndex * 20}
                  roughness={0.7}
                  opacity={0.5}
                />
              );
            })}

            {nodes.map((node) => (
              <g key={node.index}>
                <RoughShape
                  shape={{ kind: "rectangle", x: node.x, y: node.y, width: nodeWidth, height: node.height }}
                  seed={`${id}-node-${node.index}`}
                  stroke={seriesColor(colorScheme, node.index)}
                  strokeWidth={STROKE.regular}
                  fill={seriesColor(colorScheme, node.index)}
                  fillStyle="solid"
                />
                <text
                  x={node.x + nodeWidth + 4}
                  y={node.y + node.height / 2 + 3}
                  className="fill-[#2f2f2f] text-[10px]"
                  stroke="#ffffff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {node.name}
                </text>
              </g>
            ))}
          </g>
        );
      }}
    </ChartShell>
  );
};

export interface ChordChartProps extends BaseChartProps {
  data?: ChordData | null;
  sort?: boolean;
  sortSubGroups?: boolean;
  padAngle?: number;
}

const TAU = Math.PI * 2;

const polar = (cx: number, cy: number, radius: number, angle: number): [number, number] => [
  cx + Math.cos(angle) * radius,
  cy + Math.sin(angle) * radius,
];

/** Mirrors `Ivy.ChordChart`. */
export const ChordChart = ({
  id,
  data,
  padAngle = 0.04,
  colorScheme,
  legend,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: ChordChartProps) => {
  const entries = (data?.nodes ?? []).map((node, index) => ({
    name: node.name,
    color: seriesColor(colorScheme, index),
  }));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height ?? "20rem"}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        if (!data || data.nodes.length === 0) return null;

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2 - 34;
        const inner = radius - 12;

        const totals = data.nodes.map((_, index) =>
          data.links
            .filter((link) => link.source === index || link.target === index)
            .reduce((sum, link) => sum + link.value, 0),
        );
        const grandTotal = totals.reduce((sum, value) => sum + value, 0) || 1;
        const padTotal = padAngle * data.nodes.length;

        const arcs = totals.map((total, index) => {
          const start =
            totals.slice(0, index).reduce((sum, value) => sum + value, 0) / grandTotal * (TAU - padTotal) +
            padAngle * index;
          const sweep = (total / grandTotal) * (TAU - padTotal);
          return { start, end: start + sweep, mid: start + sweep / 2, index };
        });

        return (
          <>
            {data.links.map((link, linkIndex) => {
              const source = arcs[link.source];
              const target = arcs[link.target];
              if (!source || !target) return null;
              const [x1, y1] = polar(cx, cy, inner, source.mid);
              const [x2, y2] = polar(cx, cy, inner, target.mid);
              return (
                <RoughShape
                  key={linkIndex}
                  shape={{ kind: "path", d: `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}` }}
                  seed={`${id}-chord-${linkIndex}`}
                  stroke={seriesColor(colorScheme, link.source)}
                  strokeWidth={Math.max(1.2, Math.min(14, (link.value / grandTotal) * 60))}
                  roughness={0.8}
                  opacity={0.45}
                />
              );
            })}

            {arcs.map((arc) => {
              const [labelX, labelY] = polar(cx, cy, radius + 14, arc.mid);
              return (
                <g key={arc.index}>
                  <RoughShape
                    shape={{
                      kind: "arc",
                      x: cx,
                      y: cy,
                      width: radius * 2,
                      height: radius * 2,
                      start: arc.start,
                      stop: arc.end,
                    }}
                    seed={`${id}-arc-${arc.index}`}
                    stroke={seriesColor(colorScheme, arc.index)}
                    strokeWidth={7}
                    roughness={0.8}
                  />
                  <text
                    x={labelX}
                    y={labelY + 3}
                    textAnchor={Math.abs(labelX - cx) < 8 ? "middle" : labelX > cx ? "start" : "end"}
                    className="fill-[#8b8b8b] text-[10px]"
                  >
                    {data.nodes[arc.index]?.name}
                  </text>
                </g>
              );
            })}
          </>
        );
      }}
    </ChartShell>
  );
};
