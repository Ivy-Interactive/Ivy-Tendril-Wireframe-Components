import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScatterChart } from "@/widgets/charts/CartesianCharts";
import { sales } from "../data";

const meta = {
  title: "Charts/ScatterChart",
  component: ScatterChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.ScatterChart`. `shape` picks the marker, and `line` with `lineType=\"Fitting\"` draws a trend through the points.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: {
    id: "scatter",
    width: "34rem",
    data: sales,
    xAxis: [{ dataKey: "month" }],
    scatters: [{ dataKey: "revenue", name: "Revenue", shape: "Diamond" }],
  },
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFittingLine: Story = {
  args: {
    scatters: [
      { dataKey: "revenue", name: "Revenue", shape: "Diamond", line: true, lineType: "Fitting" },
    ],
  },
};
