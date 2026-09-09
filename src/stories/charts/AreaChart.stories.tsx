import type { Meta, StoryObj } from "@storybook/react-vite";
import { AreaChart } from "@/widgets/charts/CartesianCharts";
import { sales } from "../data";

const meta = {
  title: "Charts/AreaChart",
  component: AreaChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.AreaChart`. The filled band under each series is hatched by rough.js, so overlapping areas stay readable without needing transparency.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: {
    id: "area",
    width: "34rem",
    data: sales,
    xAxis: [{ dataKey: "month" }],
    areas: [
      { dataKey: "revenue", name: "Revenue", curveType: "Monotone" },
      { dataKey: "cost", name: "Cost", curveType: "Monotone" },
    ],
  },
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Stacked: Story = {
  args: {
    id: "area-stacked",
    areas: [
      { dataKey: "revenue", name: "Revenue", stackId: "a" },
      { dataKey: "cost", name: "Cost", stackId: "a" },
    ],
  },
};
