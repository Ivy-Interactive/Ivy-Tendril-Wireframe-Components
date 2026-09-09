import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@/widgets/primitives/Feedback";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Skeleton`. Ruled lines standing in for text that has not arrived yet.",
      },
    },
  },
  args: { lines: 3, width: "16rem" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Paragraph: Story = {
  args: { lines: 6, width: "24rem" },
};
