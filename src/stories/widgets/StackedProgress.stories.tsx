import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackedProgress } from "@/widgets/Progress";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/StackedProgress",
  component: StackedProgress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.StackedProgress`. One bar split into labelled segments — how a total divides, rather than how far along it is.",
      },
    },
  },
  args: {
    width: "24rem",
    segments: [
      { value: 40, label: "Done", color: "Green" },
      { value: 30, label: "In progress", color: "Amber" },
      { value: 30, label: "Not started", color: "Slate" },
    ],
  },
} satisfies Meta<typeof StackedProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { selected: 0 },
};

export const TwoWay: Story = {
  render: (args) => (
    <Stack>
      <StackedProgress
        {...args}
        segments={[
          { value: 62, label: "Used", color: "Blue" },
          { value: 38, label: "Free", color: "Slate" },
        ]}
      />
    </Stack>
  ),
};
