import type { Meta, StoryObj } from "@storybook/react-vite";
import { PieChart } from "@/widgets/charts/RadialCharts";
import { share } from "../data";

const meta = {
  title: "Charts/PieChart",
  component: PieChart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.PieChart`. An `innerRadius` on the series turns the pie into a donut, and `total` prints a figure in the hole.",
      },
    },
  },
  argTypes: { colorScheme: { control: "inline-radio", options: ["Default", "Rainbow"] } },
  args: {
    id: "pie",
    width: "20rem",
    data: share,
    pies: [{ dataKey: "value", nameKey: "name" }],
  },
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Donut: Story = {
  args: {
    id: "donut",
    colorScheme: "Rainbow",
    pies: [{ dataKey: "value", nameKey: "name", innerRadius: "55%" }],
    total: { formattedValue: "100", label: "days" },
  },
};
