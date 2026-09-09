import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChordChart } from "@/widgets/charts/FlowCharts";
import { chord } from "./chartData";

const meta = {
  title: "Charts/ChordChart",
  component: ChordChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.ChordChart`. The same `{ nodes, links }` shape as `SankeyChart`, wrapped into a circle — for flows that come back round to where they started.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: { id: "chord", width: "24rem", height: "22rem", data: chord },
} satisfies Meta<typeof ChordChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Rainbow: Story = {
  args: { colorScheme: "Rainbow" },
};
