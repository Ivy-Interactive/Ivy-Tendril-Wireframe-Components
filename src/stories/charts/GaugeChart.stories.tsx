import type { Meta, StoryObj } from "@storybook/react-vite";
import { GaugeChart } from "@/widgets/charts/RadialCharts";

const meta = {
  title: "Charts/GaugeChart",
  component: GaugeChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.GaugeChart`. `thresholds` colour the arc in bands, and `pointer` decides how the needle is drawn.",
      },
    },
  },
  args: { id: "gauge", width: "20rem", value: 72, label: "Capacity" },
} satisfies Meta<typeof GaugeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithThresholds: Story = {
  args: {
    id: "gauge-thresholds",
    value: 38,
    label: "Error budget",
    thresholds: [
      { value: 40, color: "Green" },
      { value: 75, color: "Amber" },
      { value: 100, color: "Red" },
    ],
    pointer: { style: "Line", length: "70%" },
  },
};
