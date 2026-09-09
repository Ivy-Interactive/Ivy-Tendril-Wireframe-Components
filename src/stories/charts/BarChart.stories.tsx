import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "@/widgets/charts/CartesianCharts";
import { sales } from "../data";

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.BarChart`. Bars sharing a `stackId` stack; `layout=\"Vertical\"` turns the chart on its side. Drawn with rough.js, so the bars are hatched rather than filled flat.",
      },
    },
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["Horizontal", "Vertical"] },
    colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] },
  },
  args: {
    id: "bar",
    width: "26rem",
    data: sales,
    xAxis: [{ dataKey: "month" }],
    bars: [
      { dataKey: "revenue", name: "Revenue" },
      { dataKey: "cost", name: "Cost" },
    ],
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};

export const Stacked: Story = {
  args: {
    id: "bar-stacked",
    bars: [
      { dataKey: "revenue", name: "Revenue", stackId: "a" },
      { dataKey: "cost", name: "Cost", stackId: "a" },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    id: "bar-horizontal",
    layout: "Vertical",
    bars: [{ dataKey: "revenue", name: "Revenue" }],
  },
};
