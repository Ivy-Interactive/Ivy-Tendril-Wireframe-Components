import type { Meta, StoryObj } from "@storybook/react-vite";
import { SankeyChart } from "@/widgets/charts/FlowCharts";
import { flow } from "./chartData";

const meta = {
  title: "Charts/SankeyChart",
  component: SankeyChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.SankeyChart`. Nodes and links arrive as one `data` object; `nodeAlign` decides how the columns are justified.",
      },
    },
  },
  argTypes: { nodeAlign: { control: "inline-radio", options: ["Justify", "Left"] } },
  args: { id: "sankey", width: "34rem", height: "20rem", data: flow },
} satisfies Meta<typeof SankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LeftAligned: Story = {
  args: { id: "sankey-left", nodeAlign: "Left" },
};
