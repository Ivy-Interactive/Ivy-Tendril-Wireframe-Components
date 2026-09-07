import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, INK_MUTED, PAPER_RAISED, STROKE, seriesColor, type ColorScheme } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";
import type { CartesianGridProps, ChartData, LegendProps, XAxisProps, YAxisProps } from "./types";

export interface SeriesLegendEntry {
  name: string;
  color: string;
}

export const LEGEND_ALIGN: Record<string, string> = {
  Left: "justify-start",
  Center: "justify-center",
  Right: "justify-end",
};

export const ChartLegend = ({
  entries,
  legend,
}: {
  entries: SeriesLegendEntry[];
  legend?: LegendProps;
}) => {
  if (entries.length === 0) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 px-2 pt-1 text-xs text-ink-muted",
        LEGEND_ALIGN[legend?.align ?? "Center"],
        legend?.layout === "Vertical" && "flex-col",
      )}
    >
      {entries.map((entry) => (
        <span key={entry.name} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block"
            style={{
              width: legend?.iconSize ?? 10,
              height: legend?.iconSize ?? 10,
              background: entry.color,
              borderRadius: "45% 55% 50% 50%",
            }}
          />
          {entry.name}
        </span>
      ))}
    </div>
  );
};

export interface ChartShellProps extends WidgetBaseProps {
  legend?: LegendProps;
  legendEntries?: SeriesLegendEntry[];
  /** Receives the plot area in pixels once it has been measured. */
  children: (size: { width: number; height: number }) => React.ReactNode;
}

/** Paper, border, legend and a measured drawing area for every chart. */
export const ChartShell = ({
  id,
  width = "100%",
  height = "18rem",
  aspectRatio,
  visible,
  className,
  style,
  legend,
  legendEntries = [],
  children,
  ...rest
}: ChartShellProps) => {
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const top = legend?.verticalAlign === "Top";

  return (
    <SketchFrame
      id={id}
      seed={id ?? "chart"}
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("block", className)}
      contentClassName="flex h-full flex-col"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      data-testid={rest["data-testid"]}
    >
      {top && <ChartLegend entries={legendEntries} legend={legend} />}
      <div ref={ref} className="relative min-h-0 flex-1">
        {w > 0 && h > 0 && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            width={w}
            height={h}
          >
            {children({ width: w, height: h })}
          </svg>
        )}
      </div>
      {!top && <ChartLegend entries={legendEntries} legend={legend} />}
    </SketchFrame>
  );
};

export interface Scales {
  plot: { left: number; top: number; width: number; height: number };
  xOf: (index: number) => number;
  yOf: (value: number) => number;
  bandWidth: number;
  yMin: number;
  yMax: number;
  ticks: number[];
}

export function buildScales(
  width: number,
  height: number,
  data: ChartData[],
  values: number[],
  options: { tickCount?: number; padLeft?: number; padBottom?: number; zeroBased?: boolean } = {},
): Scales {
  const left = options.padLeft ?? 46;
  const bottom = options.padBottom ?? 28;
  const top = 12;
  const right = 14;

  const plot = {
    left,
    top,
    width: Math.max(1, width - left - right),
    height: Math.max(1, height - top - bottom),
  };

  const finite = values.filter((value) => Number.isFinite(value));
  let min = finite.length ? Math.min(...finite) : 0;
  let max = finite.length ? Math.max(...finite) : 1;
  if (options.zeroBased !== false) min = Math.min(0, min);
  if (min === max) max = min + 1;
  const padding = (max - min) * 0.08;
  max += padding;

  const tickCount = Math.max(2, options.tickCount ?? 5);
  const ticks = Array.from({ length: tickCount }, (_, index) => min + ((max - min) * index) / (tickCount - 1));

  const count = Math.max(1, data.length);
  const bandWidth = plot.width / count;

  return {
    plot,
    bandWidth,
    yMin: min,
    yMax: max,
    ticks,
    xOf: (index: number) => plot.left + bandWidth * (index + 0.5),
    yOf: (value: number) =>
      plot.top + plot.height - ((value - min) / (max - min)) * plot.height,
  };
}

export const formatTick = (value: number) =>
  Math.abs(value) >= 1000
    ? new Intl.NumberFormat(undefined, { notation: "compact" }).format(value)
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);

export interface AxesProps {
  scales: Scales;
  data: ChartData[];
  categoryKey?: string;
  grid?: CartesianGridProps;
  xAxis?: XAxisProps;
  yAxis?: YAxisProps;
  seed: string;
}

/** Hand-drawn axes, ticks and grid lines shared by the cartesian charts. */
export const Axes = ({ scales, data, categoryKey, grid, xAxis, yAxis, seed }: AxesProps) => {
  const { plot, ticks, xOf, yOf } = scales;
  const showHorizontal = grid?.horizontal !== false;
  const showVertical = grid?.vertical === true;
  const gridStroke = grid?.stroke ?? INK_FAINT;

  return (
    <g>
      {showHorizontal &&
        ticks.map((tick, index) => (
          <RoughShape
            key={`grid-h-${index}`}
            shape={{ kind: "line", x1: plot.left, y1: yOf(tick), x2: plot.left + plot.width, y2: yOf(tick) }}
            seed={`${seed}-grid-h-${index}`}
            stroke={gridStroke}
            strokeWidth={STROKE.hairline}
            roughness={0.8}
            strokeLineDash={[4, 4]}
          />
        ))}

      {showVertical &&
        data.map((_, index) => (
          <RoughShape
            key={`grid-v-${index}`}
            shape={{ kind: "line", x1: xOf(index), y1: plot.top, x2: xOf(index), y2: plot.top + plot.height }}
            seed={`${seed}-grid-v-${index}`}
            stroke={gridStroke}
            strokeWidth={STROKE.hairline}
            roughness={0.8}
            strokeLineDash={[4, 4]}
          />
        ))}

      {yAxis?.axisLine !== false && (
        <RoughShape
          shape={{ kind: "line", x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.top + plot.height }}
          seed={`${seed}-y-axis`}
          stroke={INK_MUTED}
          strokeWidth={STROKE.regular}
        />
      )}
      {xAxis?.axisLine !== false && (
        <RoughShape
          shape={{
            kind: "line",
            x1: plot.left,
            y1: plot.top + plot.height,
            x2: plot.left + plot.width,
            y2: plot.top + plot.height,
          }}
          seed={`${seed}-x-axis`}
          stroke={INK_MUTED}
          strokeWidth={STROKE.regular}
        />
      )}

      {yAxis?.hideTickLabels !== true &&
        ticks.map((tick, index) => (
          <text
            key={`y-tick-${index}`}
            x={plot.left - 6}
            y={yOf(tick) + 3}
            textAnchor="end"
            className="fill-[#8b8b8b] text-[10px]"
          >
            {formatTick(tick)}
            {yAxis?.unit ?? ""}
          </text>
        ))}

      {xAxis?.hideTickLabels !== true &&
        data.map((row, index) => {
          const label = String(row[categoryKey ?? xAxis?.dataKey ?? ""] ?? index + 1);
          const skip = data.length > 12 ? Math.ceil(data.length / 12) : 1;
          if (index % skip !== 0) return null;
          return (
            <text
              key={`x-tick-${index}`}
              x={xOf(index)}
              y={plot.top + plot.height + 15}
              textAnchor="middle"
              className="fill-[#8b8b8b] text-[10px]"
              transform={xAxis?.angle ? `rotate(${xAxis.angle} ${xOf(index)} ${plot.top + plot.height + 15})` : undefined}
            >
              {label}
            </text>
          );
        })}

      {yAxis?.label && (
        <text
          x={12}
          y={plot.top + plot.height / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${plot.top + plot.height / 2})`}
          className="fill-[#8b8b8b] text-[10px]"
        >
          {yAxis.label}
        </text>
      )}
      {xAxis?.label && (
        <text
          x={plot.left + plot.width / 2}
          y={plot.top + plot.height + 27}
          textAnchor="middle"
          className="fill-[#8b8b8b] text-[10px]"
        >
          {xAxis.label}
        </text>
      )}
    </g>
  );
};

export const legendEntriesFrom = <T extends { dataKey: string; name?: string | null }>(
  series: T[],
  scheme: ColorScheme | undefined,
  colorOf: (item: T, index: number) => string | null | undefined,
): SeriesLegendEntry[] =>
  series.map((item, index) => ({
    name: item.name ?? item.dataKey,
    color: colorOf(item, index) ?? seriesColor(scheme, index),
  }));
