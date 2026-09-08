import * as React from "react";
import { INK, INK_FAINT, STROKE, resolveColor, seriesColor } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { ChartShell } from "./ChartShell";
import type {
  BaseChartProps,
  ChartData,
  FunnelSeries,
  GaugePointer,
  GaugeThreshold,
  PieSeries,
  RadarIndicator,
  RadarSeries,
} from "./types";

const TAU = Math.PI * 2;

const polar = (cx: number, cy: number, radius: number, angle: number): [number, number] => [
  cx + Math.cos(angle) * radius,
  cy + Math.sin(angle) * radius,
];

/** Donut/pie wedge as an SVG path, so rough.js can scribble over it. */
function wedgePath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  const [x1, y1] = polar(cx, cy, outer, start);
  const [x2, y2] = polar(cx, cy, outer, end);
  if (inner <= 0) {
    return `M ${cx} ${cy} L ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }
  const [x3, y3] = polar(cx, cy, inner, end);
  const [x4, y4] = polar(cx, cy, inner, start);
  return [
    `M ${x1} ${y1}`,
    `A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

const radiusFrom = (value: string | number | undefined, base: number, fallback: number) => {
  if (value === undefined) return fallback;
  if (typeof value === "number") return value;
  const percent = /^(\d+(?:\.\d+)?)%$/.exec(value);
  return percent ? (Number(percent[1]) / 100) * base : Number(value) || fallback;
};

export interface PieChartProps extends BaseChartProps {
  data?: ChartData[];
  pies?: PieSeries[];
  /** Centre label for a donut, e.g. total revenue. */
  total?: { formattedValue: string; label: string };
}

/**
 * Mirrors `Ivy.PieChart`.
 *
 * @tags chart proportion share donut
 * @example <PieChart data={rows} pies={[{ dataKey: "value", nameKey: "name" }]} />
 */
export const PieChart = ({
  id,
  data = [],
  pies = [],
  total,
  colorScheme,
  legend,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: PieChartProps) => {
  const pie = pies[0];
  const nameKey = pie?.nameKey ?? Object.keys(data[0] ?? {})[0];
  const dataKey = pie?.dataKey ?? Object.keys(data[0] ?? {})[1];
  const sum = data.reduce((accumulator, row) => accumulator + (Number(row[dataKey]) || 0), 0) || 1;

  const entries = data.map((row, index) => ({
    name: String(row[nameKey]),
    color: seriesColor(colorScheme, index),
  }));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h / 2;
        const base = Math.min(w, h) / 2;
        const outer = radiusFrom(pie?.outerRadius, base, base * 0.82);
        const inner = radiusFrom(pie?.innerRadius, base, 0);
        const startAngle = ((pie?.startAngle ?? 90) * Math.PI) / 180;

        let angle = -startAngle;

        return (
          <>
            {data.map((row, index) => {
              const value = Number(row[dataKey]) || 0;
              const sweep = (value / sum) * TAU;
              const start = angle;
              angle += sweep;
              if (sweep <= 0) return null;
              const color = pie?.fill ?? seriesColor(colorScheme, index);
              const mid = start + sweep / 2;
              const [labelX, labelY] = polar(cx, cy, outer * 0.72, mid);
              return (
                <g key={index}>
                  <RoughShape
                    shape={{ kind: "path", d: wedgePath(cx, cy, outer, inner, start, angle) }}
                    seed={`${id}-wedge-${index}`}
                    stroke={pie?.stroke ?? color}
                    strokeWidth={pie?.strokeWidth ?? 1.3}
                    fill={color}
                    fillStyle="hachure"
                    fillWeight={0.8}
                    hachureAngle={-45 + index * 27}
                  />
                  {sweep > 0.35 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      className="fill-[#2f2f2f] text-[10px] font-bold"
                      stroke="#ffffff"
                      strokeWidth={3}
                      paintOrder="stroke"
                    >
                      {Math.round((value / sum) * 100)}%
                    </text>
                  )}
                </g>
              );
            })}
            {total && inner > 0 && (
              <>
                <text x={cx} y={cy - 2} textAnchor="middle" className="fill-[#2f2f2f] text-base font-bold">
                  {total.formattedValue}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#8b8b8b] text-[10px]">
                  {total.label}
                </text>
              </>
            )}
          </>
        );
      }}
    </ChartShell>
  );
};

export interface RadarChartProps extends BaseChartProps {
  data?: ChartData[];
  radars?: RadarSeries[];
  indicators?: RadarIndicator[];
  shape?: "Polygon" | "Circle";
  splitLine?: boolean;
  /** Shades alternate rings, the way Ivy's `SplitArea` does. */
  splitArea?: boolean;
  axisLine?: boolean;
  radius?: string | number;
  startAngle?: number;
  /** Centre of the web, as a percentage of the plot or a pixel value. */
  cx?: string | number;
  cy?: string | number;
}

/** Mirrors `Ivy.RadarChart`. */
export const RadarChart = ({
  id,
  data = [],
  radars = [],
  indicators,
  shape = "Polygon",
  splitLine = true,
  splitArea = false,
  axisLine = true,
  radius,
  cx: cxProp,
  cy: cyProp,
  startAngle = 90,
  colorScheme,
  legend,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: RadarChartProps) => {
  const nameKey = Object.keys(data[0] ?? {})[0];
  const axisNames = indicators?.map((indicator) => indicator.name) ?? data.map((row) => String(row[nameKey]));
  const maxValue =
    indicators?.reduce((max, indicator) => Math.max(max, indicator.max ?? 0), 0) ||
    Math.max(
      1,
      ...data.flatMap((row) => radars.map((radar) => Number(row[radar.dataKey]) || 0)),
    );

  const entries = radars.map((radar, index) => ({
    name: radar.name ?? radar.dataKey,
    color: radar.stroke ?? seriesColor(colorScheme, index),
  }));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const cx = radiusFrom(cxProp, w, w / 2);
        const cy = radiusFrom(cyProp, h, h / 2);
        const outer = radiusFrom(radius, Math.min(w, h) / 2, (Math.min(w, h) / 2) * 0.72);
        const count = Math.max(3, axisNames.length);
        const offset = (-startAngle * Math.PI) / 180;
        const angleOf = (index: number) => (index / count) * TAU + offset;
        const rings = [0.25, 0.5, 0.75, 1];

        return (
          <>
            {splitArea &&
              rings.map((ring, ringIndex) =>
                ringIndex % 2 === 0 ? null : (
                  <RoughShape
                    key={`split-${ringIndex}`}
                    shape={{
                      kind: "polygon",
                      points: Array.from({ length: count }, (_, index) =>
                        polar(cx, cy, outer * ring, angleOf(index)),
                      ),
                    }}
                    seed={`${id}-split-${ringIndex}`}
                    stroke="none"
                    fill={INK_FAINT}
                    fillStyle="hachure"
                    fillWeight={0.4}
                    hachureGap={8}
                    opacity={0.4}
                  />
                ),
              )}
            {splitLine &&
              rings.map((ring, ringIndex) =>
                shape === "Circle" ? (
                  <RoughShape
                    key={ringIndex}
                    shape={{ kind: "circle", cx, cy, diameter: outer * ring * 2 }}
                    seed={`${id}-ring-${ringIndex}`}
                    stroke={INK_FAINT}
                    strokeWidth={STROKE.hairline}
                    roughness={0.9}
                  />
                ) : (
                  <RoughShape
                    key={ringIndex}
                    shape={{
                      kind: "polygon",
                      points: Array.from({ length: count }, (_, index) =>
                        polar(cx, cy, outer * ring, angleOf(index)),
                      ),
                    }}
                    seed={`${id}-ring-${ringIndex}`}
                    stroke={INK_FAINT}
                    strokeWidth={STROKE.hairline}
                    roughness={0.9}
                  />
                ),
              )}

            {axisLine &&
              axisNames.map((_, index) => {
                const [x, y] = polar(cx, cy, outer, angleOf(index));
                return (
                  <RoughShape
                    key={`axis-${index}`}
                    shape={{ kind: "line", x1: cx, y1: cy, x2: x, y2: y }}
                    seed={`${id}-axis-${index}`}
                    stroke={INK_FAINT}
                    strokeWidth={STROKE.hairline}
                  />
                );
              })}

            {axisNames.map((name, index) => {
              const [x, y] = polar(cx, cy, outer + 14, angleOf(index));
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y + 3}
                  textAnchor={Math.abs(x - cx) < 6 ? "middle" : x > cx ? "start" : "end"}
                  className="fill-[#8b8b8b] text-[10px]"
                >
                  {name}
                </text>
              );
            })}

            {radars.map((radar, radarIndex) => {
              const color = radar.stroke ?? seriesColor(colorScheme, radarIndex);
              const points = axisNames.map((name, index) => {
                const row = indicators
                  ? data.find((entry) => String(entry[nameKey]) === name) ?? data[index]
                  : data[index];
                const value = Number(row?.[radar.dataKey]) || 0;
                return polar(cx, cy, (value / maxValue) * outer, angleOf(index));
              });
              return (
                <g key={radar.dataKey}>
                  <RoughShape
                    shape={{ kind: "polygon", points }}
                    seed={`${id}-radar-${radarIndex}`}
                    stroke={color}
                    strokeWidth={radar.strokeWidth ?? 1.6}
                    fill={radar.filled === false ? undefined : (radar.fill ?? color)}
                    fillStyle="hachure"
                    fillWeight={0.7}
                    hachureAngle={-45 + radarIndex * 35}
                    strokeLineDash={radar.strokeDashArray ? [6, 4] : undefined}
                  />
                  {radar.showSymbol !== false &&
                    points.map(([x, y], index) => (
                      <RoughShape
                        key={index}
                        shape={{ kind: "circle", cx: x, cy: y, diameter: 5 }}
                        seed={`${id}-radar-dot-${radarIndex}-${index}`}
                        stroke={color}
                        strokeWidth={STROKE.thin}
                        fill={color}
                        fillStyle="solid"
                      />
                    ))}
                </g>
              );
            })}
          </>
        );
      }}
    </ChartShell>
  );
};

export interface FunnelChartProps extends BaseChartProps {
  data?: ChartData[];
  funnels?: FunnelSeries[];
  sort?: "Descending" | "Ascending" | "None";
  orientation?: "Vertical" | "Horizontal";
  gap?: number;
}

/** Mirrors `Ivy.FunnelChart`. */
export const FunnelChart = ({
  id,
  data = [],
  funnels = [],
  sort = "Descending",
  gap = 6,
  colorScheme,
  legend,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: FunnelChartProps) => {
  const funnel = funnels[0];
  const nameKey = funnel?.nameKey ?? Object.keys(data[0] ?? {})[0];
  const dataKey = funnel?.dataKey ?? Object.keys(data[0] ?? {})[1];

  const rows = React.useMemo(() => {
    const copy = [...data];
    if (sort === "Descending") copy.sort((a, b) => Number(b[dataKey]) - Number(a[dataKey]));
    if (sort === "Ascending") copy.sort((a, b) => Number(a[dataKey]) - Number(b[dataKey]));
    return copy;
  }, [data, dataKey, sort]);

  const max = Math.max(1, ...rows.map((row) => Number(row[dataKey]) || 0));
  const entries = rows.map((row, index) => ({
    name: String(row[nameKey]),
    color: seriesColor(colorScheme, index),
  }));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
      legend={legend}
      legendEntries={entries}
    >
      {({ width: w, height: h }) => {
        const padding = 8;
        const stepHeight = (h - padding * 2 - gap * (rows.length - 1)) / Math.max(1, rows.length);
        const cx = w / 2;

        return (
          <>
            {rows.map((row, index) => {
              const value = Number(row[dataKey]) || 0;
              const nextValue = Number(rows[index + 1]?.[dataKey] ?? value) || value;
              const topWidth = (value / max) * (w * 0.78);
              const bottomWidth = (nextValue / max) * (w * 0.78);
              const y = padding + index * (stepHeight + gap);
              const color = funnel?.fill ?? seriesColor(colorScheme, index);

              return (
                <g key={index}>
                  <RoughShape
                    shape={{
                      kind: "polygon",
                      points: [
                        [cx - topWidth / 2, y],
                        [cx + topWidth / 2, y],
                        [cx + bottomWidth / 2, y + stepHeight],
                        [cx - bottomWidth / 2, y + stepHeight],
                      ],
                    }}
                    seed={`${id}-funnel-${index}`}
                    stroke={funnel?.stroke ?? color}
                    strokeWidth={funnel?.strokeWidth ?? 1.3}
                    fill={color}
                    fillStyle="hachure"
                    fillWeight={0.8}
                    hachureAngle={-45 + index * 25}
                  />
                  <text
                    x={cx}
                    y={y + stepHeight / 2 + 4}
                    textAnchor="middle"
                    className="fill-[#2f2f2f] text-[11px] font-bold"
                    stroke="#ffffff"
                    strokeWidth={3.5}
                    paintOrder="stroke"
                  >
                    {String(row[nameKey])} · {value}
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

export interface GaugeChartProps extends BaseChartProps {
  value?: number;
  min?: number;
  max?: number;
  label?: string;
  /** Degrees, measured the way Ivy does: 225 down to -45 by default. */
  startAngle?: number;
  endAngle?: number;
  thresholds?: GaugeThreshold[];
  pointer?: GaugePointer;
  animated?: boolean;
}

/**
 * Mirrors `Ivy.GaugeChart`.
 *
 * @tags chart dial meter single-value
 * @example <GaugeChart value={72} label="Capacity" />
 */
export const GaugeChart = ({
  id,
  value = 0,
  min = 0,
  max = 100,
  label,
  startAngle = 225,
  endAngle = -45,
  thresholds = [],
  pointer,
  colorScheme,
  width,
  height,
  aspectRatio,
  visible,
  density,
  className,
  style,
}: GaugeChartProps) => {
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));

  return (
    <ChartShell
      id={id}
      width={width}
      height={height ?? "14rem"}
      aspectRatio={aspectRatio}
      visible={visible}
      density={density}
      className={className}
      style={style}
    >
      {({ width: w, height: h }) => {
        const cx = w / 2;
        const cy = h * 0.6;
        const radius = Math.max(20, Math.min(w / 2 - 26, h * 0.5) * 0.92);
        const toRad = (degrees: number) => (-degrees * Math.PI) / 180;
        const start = toRad(startAngle);
        const end = toRad(endAngle);
        const sweep = end - start;
        const angleAt = (fraction: number) => start + sweep * fraction;

        const bands = thresholds.length
          ? thresholds
              .slice()
              .sort((a, b) => a.value - b.value)
              .map((threshold, index, all) => ({
                from: index === 0 ? 0 : (all[index - 1].value - min) / (max - min),
                to: (threshold.value - min) / (max - min),
                color: resolveColor(threshold.color),
              }))
          : [{ from: 0, to: 1, color: seriesColor(colorScheme, 0) }];

        const needleAngle = angleAt(ratio);
        const needleLength =
          radius * (Number((pointer?.length ?? "60%").replace("%", "")) / 100 || 0.6);
        const [needleX, needleY] = polar(cx, cy, needleLength, needleAngle);

        return (
          <>
            <RoughShape
              shape={{
                kind: "path",
                d: wedgePath(cx, cy, radius, radius * 0.72, Math.min(start, end), Math.max(start, end)),
              }}
              seed={`${id}-track`}
              stroke={INK_FAINT}
              strokeWidth={STROKE.thin}
            />
            {bands.map((band, index) => {
              const from = angleAt(band.from);
              const to = angleAt(band.to);
              return (
                <RoughShape
                  key={index}
                  shape={{
                    kind: "path",
                    d: wedgePath(cx, cy, radius, radius * 0.72, Math.min(from, to), Math.max(from, to)),
                  }}
                  seed={`${id}-band-${index}`}
                  stroke={band.color}
                  strokeWidth={STROKE.regular}
                  fill={band.color}
                  fillStyle="hachure"
                  fillWeight={0.9}
                />
              );
            })}

            <RoughShape
              shape={
                pointer?.style === "Line"
                  ? { kind: "line", x1: cx, y1: cy, x2: needleX, y2: needleY }
                  : {
                      kind: "polygon",
                      points: [
                        polar(cx, cy, (pointer?.width ?? 6) / 2, needleAngle + Math.PI / 2),
                        [needleX, needleY],
                        polar(cx, cy, (pointer?.width ?? 6) / 2, needleAngle - Math.PI / 2),
                      ],
                    }
              }
              seed={`${id}-needle`}
              stroke={INK}
              strokeWidth={STROKE.regular}
              fill={INK}
              fillStyle="solid"
            />
            <RoughShape
              shape={{ kind: "circle", cx, cy, diameter: 10 }}
              seed={`${id}-hub`}
              stroke={INK}
              strokeWidth={STROKE.regular}
              fill={INK}
              fillStyle="solid"
            />

            <text x={cx} y={cy + 30} textAnchor="middle" className="fill-[#2f2f2f] text-lg font-bold">
              {value}
            </text>
            {label && (
              <text x={cx} y={cy + 46} textAnchor="middle" className="fill-[#8b8b8b] text-[11px]">
                {label}
              </text>
            )}
            <text
              x={polar(cx, cy, radius + 12, start)[0]}
              y={polar(cx, cy, radius + 12, start)[1]}
              textAnchor="middle"
              className="fill-[#8b8b8b] text-[10px]"
            >
              {min}
            </text>
            <text
              x={polar(cx, cy, radius + 12, end)[0]}
              y={polar(cx, cy, radius + 12, end)[1]}
              textAnchor="middle"
              className="fill-[#8b8b8b] text-[10px]"
            >
              {max}
            </text>
          </>
        );
      }}
    </ChartShell>
  );
};

export { polar, wedgePath };
