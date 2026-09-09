import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadarChart } from "@/widgets/charts/RadialCharts";
import { radar } from "./chartData";

const meta = {
  title: "Charts/RadarChart",
  component: RadarChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.RadarChart`. `shape` switches the web between a polygon and a circle; each series is one closed rough path.",
      },
    },
  },
  argTypes: {
    shape: { control: "inline-radio", options: ["Polygon", "Circle"] },
    colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] },
  },
  args: {
    id: "radar",
    width: "22rem",
    data: radar,
    radars: [
      { dataKey: "planA", name: "Plan A" },
      { dataKey: "planB", name: "Plan B" },
    ],
  },
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Circular: Story = {
  args: { id: "radar-circle", shape: "Circle", radars: [{ dataKey: "planA", name: "Plan A" }] },
};
