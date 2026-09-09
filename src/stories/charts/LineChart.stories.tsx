import type { Meta, StoryObj } from "@storybook/react-vite";
import { LineChart } from "@/widgets/charts/CartesianCharts";
import { sales } from "../data";

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.LineChart`. Drawn with rough.js rather than a charting library, so the geometry matches the rest of the sketch; `lines`, `xAxis`, `yAxis` and `referenceLines` keep their Ivy shapes.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: {
    id: "line",
    width: "34rem",
    data: sales,
    xAxis: [{ dataKey: "month", label: "Month" }],
    yAxis: [{ label: "£k" }],
    lines: [
      { dataKey: "revenue", name: "Revenue" },
      { dataKey: "cost", name: "Cost", curveType: "Monotone", strokeDashArray: "4 4" },
    ],
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithReferenceLine: Story = {
  args: { referenceLines: [{ y: 200, label: "Target" }] },
};

export const Rainbow: Story = {
  args: { colorScheme: "Rainbow" },
};
