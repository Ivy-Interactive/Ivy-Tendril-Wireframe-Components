import type { Meta, StoryObj } from "@storybook/react-vite";
import { FunnelChart } from "@/widgets/charts/RadialCharts";
import { funnel } from "./chartData";

const meta = {
  title: "Charts/FunnelChart",
  component: FunnelChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.FunnelChart`. Each stage is drawn as a hand-tapered band, so the drop-off between steps is visible at a glance.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: {
    id: "funnel",
    width: "24rem",
    height: "20rem",
    data: funnel,
    funnels: [{ dataKey: "count", nameKey: "stage" }],
  },
} satisfies Meta<typeof FunnelChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rainbow: Story = {
  args: { colorScheme: "Rainbow" },
};
