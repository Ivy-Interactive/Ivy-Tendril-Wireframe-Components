import { INK, seriesColor } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { Axes, ChartShell, buildScales, legendEntriesFrom } from "./ChartShell";
import type {
  BarSeries,
  CartesianChartProps,
  ChartData,
  LineSeries,
  ScatterSeries,
  ScatterShape,
  ZAxisProps,
} from "./types";

const collect = (data: ChartData[], keys: string[]) =>
  data.flatMap((row) => keys.map((key) => Number(row[key])).filter(Number.isFinite));

const categoryKeyOf = (props: CartesianChartProps, data: ChartData[]) =>
  props.xAxis?.[0]?.dataKey ?? Object.keys(data[0] ?? {})[0];

/** Straight, monotone or stepped path through a series of points. */
function pathThrough(points: Array<[number, number]>, curve: LineSeries["curveType"]): string {
  if (points.length === 0) return "";
  if (curve === "Step") {
    return points.reduce((path, [x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;
      const [, previousY] = points[index - 1];
      return `${path} L ${x} ${previousY} L ${x} ${y}`;
    }, "");
  }
  if (curve === "Monotone" && points.length > 2) {
    return points.reduce((path, [x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;
      const [previousX, previousY] = points[index - 1];
      const midX = (previousX + x) / 2;
      return `${path} C ${midX} ${previousY}, ${midX} ${y}, ${x} ${y}`;
    }, "");
  }
  return points.reduce((path, [x, y], index) => (index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`), "");
}

export interface LineChartProps extends CartesianChartProps {
  lines?: LineSeries[];
}

/** Mirrors `Ivy.LineChart`. */
export const LineChart = ({
  id,
  data = [],
  lines = [],
  cartesianGrid,
  xAxis,
  yAxis,
  colorScheme,
  legend,
  width,
  height,
  className,
  style,
  referenceLines,
  referenceDots,
}: LineChartProps) => {
  const categoryKey = categoryKeyOf({ data, xAxis }, data);
  const values = collect(data, lines.map((line) => line.dataKey));
  const entries = legendEntriesFrom(lines, colorScheme, (line) => line.stroke);

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const scales = buildScales(w, h, data, values, { tickCount: yAxis?.[0]?.tickCount });
        return (
          <>
            <Axes
              scales={scales}
              data={data}
              categoryKey={categoryKey}
              grid={cartesianGrid}
              xAxis={xAxis?.[0]}
              yAxis={yAxis?.[0]}
              seed={`${id}-axes`}
            />
            {lines.map((line, lineIndex) => {
              const color = line.stroke ?? seriesColor(colorScheme, lineIndex);
              const points = data
                .map((row, index) => [scales.xOf(index), scales.yOf(Number(row[line.dataKey]))] as [number, number])
                .filter(([, y]) => Number.isFinite(y));
              if (points.length === 0) return null;
              return (
                <g key={line.dataKey}>
                  <RoughShape
                    shape={{ kind: "path", d: pathThrough(points, line.curveType ?? "Linear") }}
                    seed={`${id}-line-${lineIndex}`}
                    stroke={color}
                    strokeWidth={line.strokeWidth ?? 2}
                    roughness={1}
                    strokeLineDash={line.strokeDashArray ? [6, 4] : undefined}
                  />
                  {points.map(([x, y], index) => (
                    <RoughShape
                      key={index}
                      shape={{ kind: "circle", cx: x, cy: y, diameter: 6 }}
                      seed={`${id}-dot-${lineIndex}-${index}`}
                      stroke={color}
                      strokeWidth={1.2}
                      fill={color}
                      fillStyle="solid"
                    />
                  ))}
                </g>
              );
            })}
            {referenceLines?.map((line, index) =>
              line.y === undefined ? null : (
                <RoughShape
                  key={`ref-${index}`}
                  shape={{
                    kind: "line",
                    x1: scales.plot.left,
                    y1: scales.yOf(Number(line.y)),
                    x2: scales.plot.left + scales.plot.width,
                    y2: scales.yOf(Number(line.y)),
                  }}
                  seed={`${id}-ref-${index}`}
                  stroke={line.stroke ?? INK}
                  strokeWidth={1.1}
                  strokeLineDash={[7, 4]}
                />
              ),
            )}
            {referenceDots?.map((dot, index) => (
              <RoughShape
                key={`refdot-${index}`}
                shape={{ kind: "circle", cx: scales.xOf(dot.x), cy: scales.yOf(dot.y), diameter: 9 }}
                seed={`${id}-refdot-${index}`}
                stroke={INK}
                strokeWidth={1.3}
              />
            ))}
          </>
        );
      }}
    </ChartShell>
  );
};

export interface AreaChartProps extends CartesianChartProps {
  areas?: LineSeries[];
}

/** Mirrors `Ivy.AreaChart`. */
export const AreaChart = ({
  id,
  data = [],
  areas = [],
  cartesianGrid,
  xAxis,
  yAxis,
  colorScheme,
  legend,
  width,
  height,
  className,
  style,
}: AreaChartProps) => {
  const categoryKey = categoryKeyOf({ data, xAxis }, data);
  const values = collect(data, areas.map((area) => area.dataKey));
  const entries = legendEntriesFrom(areas, colorScheme, (area) => area.stroke);

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const scales = buildScales(w, h, data, values, { tickCount: yAxis?.[0]?.tickCount });
        const baseline = scales.yOf(Math.max(0, scales.yMin));
        return (
          <>
            <Axes
              scales={scales}
              data={data}
              categoryKey={categoryKey}
              grid={cartesianGrid}
              xAxis={xAxis?.[0]}
              yAxis={yAxis?.[0]}
              seed={`${id}-axes`}
            />
            {areas.map((area, areaIndex) => {
              const color = area.stroke ?? seriesColor(colorScheme, areaIndex);
              const points = data.map(
                (row, index) => [scales.xOf(index), scales.yOf(Number(row[area.dataKey]))] as [number, number],
              );
              if (points.length < 2) return null;
              const polygon: Array<[number, number]> = [
                [points[0][0], baseline],
                ...points,
                [points[points.length - 1][0], baseline],
              ];
              return (
                <g key={area.dataKey}>
                  <RoughShape
                    shape={{ kind: "polygon", points: polygon }}
                    seed={`${id}-area-${areaIndex}`}
                    stroke="none"
                    fill={color}
                    fillStyle="hachure"
                    fillWeight={0.7}
                    hachureAngle={-40 + areaIndex * 30}
                  />
                  <RoughShape
                    shape={{ kind: "path", d: pathThrough(points, area.curveType ?? "Monotone") }}
                    seed={`${id}-area-line-${areaIndex}`}
                    stroke={color}
                    strokeWidth={area.strokeWidth ?? 1.8}
                  />
                </g>
              );
            })}
          </>
        );
      }}
    </ChartShell>
  );
};

export interface BarChartProps extends CartesianChartProps {
  bars?: BarSeries[];
  barGap?: number;
  barCategoryGap?: number | string;
  maxBarSize?: number;
  reverseStackOrder?: boolean;
}

/** Mirrors `Ivy.BarChart`, including grouped, stacked and horizontal layouts. */
export const BarChart = ({
  id,
  data = [],
  bars = [],
  cartesianGrid,
  xAxis,
  yAxis,
  colorScheme,
  legend,
  barGap = 2,
  maxBarSize,
  layout = "Horizontal",
  width,
  height,
  className,
  style,
}: BarChartProps) => {
  const categoryKey = categoryKeyOf({ data, xAxis }, data);
  const stacked = bars.some((bar) => bar.stackId !== undefined);
  const values = stacked
    ? data.map((row) => bars.reduce((sum, bar) => sum + (Number(row[bar.dataKey]) || 0), 0))
    : collect(data, bars.map((bar) => bar.dataKey));
  const entries = legendEntriesFrom(bars, colorScheme, (bar) => bar.fill);
  const vertical = layout === "Vertical";

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const scales = buildScales(w, h, data, values, { tickCount: yAxis?.[0]?.tickCount });
        const { plot, bandWidth, yOf } = scales;
        const groupWidth = Math.min(bandWidth * 0.72, maxBarSize ?? Infinity);
        const barWidth = stacked ? groupWidth : (groupWidth - barGap * (bars.length - 1)) / bars.length;
        const baseline = yOf(Math.max(0, scales.yMin));

        if (vertical) {
          const rowHeight = plot.height / Math.max(1, data.length);
          const scale = (value: number) => (value / (scales.yMax || 1)) * plot.width;
          return (
            <>
              <RoughShape
                shape={{ kind: "line", x1: plot.left, y1: plot.top, x2: plot.left, y2: plot.top + plot.height }}
                seed={`${id}-v-axis`}
                stroke="#8b8b8b"
                strokeWidth={1.2}
              />
              {data.map((row, rowIndex) => {
                let offsetX = plot.left;
                return (
                  <g key={rowIndex}>
                    <text
                      x={plot.left - 6}
                      y={plot.top + rowHeight * (rowIndex + 0.5) + 3}
                      textAnchor="end"
                      className="fill-[#8b8b8b] text-[10px]"
                    >
                      {String(row[categoryKey] ?? rowIndex + 1)}
                    </text>
                    {bars.map((bar, barIndex) => {
                      const value = Number(row[bar.dataKey]) || 0;
                      const length = Math.max(1, scale(value));
                      const thickness = Math.max(
                        2,
                        (rowHeight * 0.7 - barGap * (bars.length - 1)) / (stacked ? 1 : bars.length),
                      );
                      const y = stacked
                        ? plot.top + rowHeight * rowIndex + rowHeight * 0.15
                        : plot.top + rowHeight * rowIndex + rowHeight * 0.15 + barIndex * (thickness + barGap);
                      const x = stacked ? offsetX : plot.left;
                      if (stacked) offsetX += length;
                      return (
                        <RoughShape
                          key={bar.dataKey}
                          shape={{ kind: "rectangle", x, y, width: length, height: thickness }}
                          seed={`${id}-bar-${rowIndex}-${barIndex}`}
                          stroke={bar.stroke ?? bar.fill ?? seriesColor(colorScheme, barIndex)}
                          strokeWidth={bar.strokeWidth ?? 1.2}
                          fill={bar.fill ?? seriesColor(colorScheme, barIndex)}
                          fillStyle="hachure"
                          fillWeight={0.8}
                          hachureAngle={-45 + barIndex * 30}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </>
          );
        }

        return (
          <>
            <Axes
              scales={scales}
              data={data}
              categoryKey={categoryKey}
              grid={cartesianGrid}
              xAxis={xAxis?.[0]}
              yAxis={yAxis?.[0]}
              seed={`${id}-axes`}
            />
            {data.map((row, rowIndex) => {
              let stackTop = baseline;
              return (
                <g key={rowIndex}>
                  {bars.map((bar, barIndex) => {
                    const value = Number(row[bar.dataKey]) || 0;
                    const barHeight = Math.max(1, baseline - yOf(value));
                    const x = stacked
                      ? plot.left + bandWidth * rowIndex + (bandWidth - groupWidth) / 2
                      : plot.left +
                        bandWidth * rowIndex +
                        (bandWidth - groupWidth) / 2 +
                        barIndex * (barWidth + barGap);
                    const y = stacked ? stackTop - barHeight : yOf(value);
                    if (stacked) stackTop -= barHeight;
                    return (
                      <RoughShape
                        key={bar.dataKey}
                        shape={{
                          kind: "rectangle",
                          x,
                          y,
                          width: stacked ? groupWidth : Math.max(2, barWidth),
                          height: barHeight,
                        }}
                        seed={`${id}-bar-${rowIndex}-${barIndex}`}
                        stroke={bar.stroke ?? bar.fill ?? seriesColor(colorScheme, barIndex)}
                        strokeWidth={bar.strokeWidth ?? 1.2}
                        fill={bar.fill ?? seriesColor(colorScheme, barIndex)}
                        fillStyle="hachure"
                        fillWeight={0.8}
                        hachureAngle={-45 + barIndex * 30}
                      />
                    );
                  })}
                </g>
              );
            })}
          </>
        );
      }}
    </ChartShell>
  );
};

const SHAPE_SIZE = 9;

const scatterMark = (
  shape: ScatterShape | undefined,
  x: number,
  y: number,
  size: number,
): Parameters<typeof RoughShape>[0]["shape"] => {
  const half = size / 2;
  switch (shape) {
    case "Square":
      return { kind: "rectangle", x: x - half, y: y - half, width: size, height: size };
    case "Diamond":
      return {
        kind: "polygon",
        points: [
          [x, y - half],
          [x + half, y],
          [x, y + half],
          [x - half, y],
        ],
      };
    case "Triangle":
      return {
        kind: "polygon",
        points: [
          [x, y - half],
          [x + half, y + half],
          [x - half, y + half],
        ],
      };
    case "Cross":
      return {
        kind: "linearPath",
        points: [
          [x - half, y],
          [x + half, y],
        ],
      };
    case "Star":
      return {
        kind: "polygon",
        points: Array.from({ length: 10 }, (_, index) => {
          const radius = index % 2 === 0 ? half : half / 2.2;
          const angle = (Math.PI / 5) * index - Math.PI / 2;
          return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius] as [number, number];
        }),
      };
    case "Wye":
      return {
        kind: "linearPath",
        points: [
          [x, y],
          [x, y - half],
          [x, y],
          [x - half, y + half],
          [x, y],
          [x + half, y + half],
        ],
      };
    default:
      return { kind: "circle", cx: x, cy: y, diameter: size };
  }
};

export interface ScatterChartProps extends CartesianChartProps {
  scatters?: ScatterSeries[];
  zAxis?: ZAxisProps | null;
}

/** Mirrors `Ivy.ScatterChart`. */
export const ScatterChart = ({
  id,
  data = [],
  scatters = [],
  zAxis,
  cartesianGrid,
  xAxis,
  yAxis,
  colorScheme,
  legend,
  width,
  height,
  className,
  style,
}: ScatterChartProps) => {
  const categoryKey = categoryKeyOf({ data, xAxis }, data);
  const values = collect(data, scatters.map((scatter) => scatter.dataKey));
  const entries = scatters.map((scatter, index) => ({
    name: scatter.name,
    color: scatter.fill ?? seriesColor(colorScheme, index),
  }));

  const zValues = zAxis?.dataKey ? data.map((row) => Number(row[zAxis.dataKey!]) || 0) : [];
  const zMax = zValues.length ? Math.max(...zValues) : 1;

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const scales = buildScales(w, h, data, values, { tickCount: yAxis?.[0]?.tickCount });
        return (
          <>
            <Axes
              scales={scales}
              data={data}
              categoryKey={categoryKey}
              grid={cartesianGrid}
              xAxis={xAxis?.[0]}
              yAxis={yAxis?.[0]}
              seed={`${id}-axes`}
            />
            {scatters.map((scatter, scatterIndex) => {
              const color = scatter.fill ?? seriesColor(colorScheme, scatterIndex);
              const points = data.map(
                (row, index) =>
                  [scales.xOf(index), scales.yOf(Number(row[scatter.dataKey]))] as [number, number],
              );
              return (
                <g key={scatter.name}>
                  {scatter.line && points.length > 1 && (
                    <RoughShape
                      shape={{ kind: "path", d: pathThrough(points, "Linear") }}
                      seed={`${id}-scatter-line-${scatterIndex}`}
                      stroke={color}
                      strokeWidth={1.2}
                      strokeLineDash={scatter.lineType === "Fitting" ? [6, 4] : undefined}
                    />
                  )}
                  {points.map(([x, y], index) => {
                    const size = zAxis?.dataKey
                      ? (zAxis.rangeMin ?? 6) +
                        ((Number(data[index][zAxis.dataKey]) || 0) / (zMax || 1)) *
                          ((zAxis.rangeMax ?? 20) - (zAxis.rangeMin ?? 6))
                      : SHAPE_SIZE;
                    return (
                      <RoughShape
                        key={index}
                        shape={scatterMark(scatter.shape, x, y, size)}
                        seed={`${id}-scatter-${scatterIndex}-${index}`}
                        stroke={scatter.stroke ?? color}
                        strokeWidth={scatter.strokeWidth ?? 1.2}
                        fill={color}
                        fillStyle="hachure"
                        fillWeight={0.7}
                      />
                    );
                  })}
                </g>
              );
            })}
          </>
        );
      }}
    </ChartShell>
  );
};
