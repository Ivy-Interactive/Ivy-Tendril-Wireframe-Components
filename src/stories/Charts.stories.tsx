import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaChart, BarChart, LineChart, ScatterChart } from "@/widgets/charts/CartesianCharts";
import { FunnelChart, GaugeChart, PieChart, RadarChart } from "@/widgets/charts/RadialCharts";
import { ChordChart, SankeyChart } from "@/widgets/charts/FlowCharts";
import { sales, share } from "./data";

const meta: Meta = {
  title: "Charts/Overview",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "All ten `Ivy` charts, drawn with rough.js rather than a charting library, so the geometry matches the rest of the sketch. Series props (`lines`, `bars`, `areas`, `scatters`, `pies`, `radars`, `funnels`) keep their Ivy shapes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const radar = [
  { axis: "Speed", planA: 80, planB: 55 },
  { axis: "Cost", planA: 45, planB: 70 },
  { axis: "Quality", planA: 90, planB: 60 },
  { axis: "Reach", planA: 55, planB: 85 },
  { axis: "Risk", planA: 30, planB: 50 },
];

const funnel = [
  { stage: "Visits", count: 1000 },
  { stage: "Signups", count: 420 },
  { stage: "Trials", count: 180 },
  { stage: "Paid", count: 60 },
];

const flow = {
  nodes: [{ name: "Ads" }, { name: "Search" }, { name: "Signup" }, { name: "Paid" }, { name: "Churn" }],
  links: [
    { source: 0, target: 2, value: 30 },
    { source: 1, target: 2, value: 50 },
    { source: 2, target: 3, value: 45 },
    { source: 2, target: 4, value: 35 },
  ],
};

export const Line: Story = {
  render: () => (
    <LineChart
      id="line"
      width="34rem"
      data={sales}
      xAxis={[{ dataKey: "month", label: "Month" }]}
      yAxis={[{ label: "£k" }]}
      lines={[
        { dataKey: "revenue", name: "Revenue" },
        { dataKey: "cost", name: "Cost", curveType: "Monotone", strokeDashArray: "4 4" },
      ]}
      referenceLines={[{ y: 200, label: "Target" }]}
    />
  ),
};

export const Bar: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <BarChart
        id="bar-grouped"
        width="26rem"
        data={sales}
        xAxis={[{ dataKey: "month" }]}
        bars={[
          { dataKey: "revenue", name: "Revenue" },
          { dataKey: "cost", name: "Cost" },
        ]}
      />
      <BarChart
        id="bar-stacked"
        width="26rem"
        data={sales}
        xAxis={[{ dataKey: "month" }]}
        bars={[
          { dataKey: "revenue", name: "Revenue", stackId: "a" },
          { dataKey: "cost", name: "Cost", stackId: "a" },
        ]}
      />
      <BarChart
        id="bar-horizontal"
        width="26rem"
        layout="Vertical"
        data={sales}
        xAxis={[{ dataKey: "month" }]}
        bars={[{ dataKey: "revenue", name: "Revenue" }]}
      />
    </div>
  ),
};

export const Area: Story = {
  render: () => (
    <AreaChart
      id="area"
      width="34rem"
      data={sales}
      xAxis={[{ dataKey: "month" }]}
      areas={[
        { dataKey: "revenue", name: "Revenue", curveType: "Monotone" },
        { dataKey: "cost", name: "Cost", curveType: "Monotone" },
      ]}
    />
  ),
};

export const Scatter: Story = {
  render: () => (
    <ScatterChart
      id="scatter"
      width="34rem"
      data={sales}
      xAxis={[{ dataKey: "month" }]}
      scatters={[{ dataKey: "revenue", name: "Revenue", shape: "Diamond", line: true, lineType: "Fitting" }]}
    />
  ),
};

export const Pie: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PieChart id="pie" width="20rem" data={share} pies={[{ dataKey: "value", nameKey: "name" }]} />
      <PieChart
        id="donut"
        width="20rem"
        data={share}
        colorScheme="Rainbow"
        pies={[{ dataKey: "value", nameKey: "name", innerRadius: "55%" }]}
        total={{ formattedValue: "100", label: "days" }}
      />
    </div>
  ),
};

export const Radar: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <RadarChart
        id="radar"
        width="22rem"
        data={radar}
        radars={[
          { dataKey: "planA", name: "Plan A" },
          { dataKey: "planB", name: "Plan B" },
        ]}
      />
      <RadarChart
        id="radar-circle"
        width="22rem"
        shape="Circle"
        data={radar}
        radars={[{ dataKey: "planA", name: "Plan A" }]}
      />
    </div>
  ),
};

export const Funnel: Story = {
  render: () => (
    <FunnelChart
      id="funnel"
      width="24rem"
      height="20rem"
      data={funnel}
      funnels={[{ dataKey: "count", nameKey: "stage" }]}
    />
  ),
};

export const Gauge: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <GaugeChart id="gauge" width="20rem" value={72} label="Capacity" />
      <GaugeChart
        id="gauge-thresholds"
        width="20rem"
        value={38}
        label="Error budget"
        thresholds={[
          { value: 40, color: "Green" },
          { value: 75, color: "Amber" },
          { value: 100, color: "Red" },
        ]}
        pointer={{ style: "Line", length: "70%" }}
      />
    </div>
  ),
};

export const Sankey: Story = {
  render: () => <SankeyChart id="sankey" width="34rem" height="20rem" data={flow} />,
};

export const Chord: Story = {
  render: () => (
    <ChordChart
      id="chord"
      width="24rem"
      height="22rem"
      data={{
        nodes: [{ name: "Design" }, { name: "Build" }, { name: "Test" }, { name: "Ship" }],
        links: [
          { source: 0, target: 1, value: 12 },
          { source: 1, target: 2, value: 8 },
          { source: 2, target: 3, value: 15 },
          { source: 3, target: 0, value: 6 },
        ],
      }}
    />
  ),
};
