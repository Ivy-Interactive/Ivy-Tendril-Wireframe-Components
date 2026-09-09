import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "@/widgets/primitives/Misc";

const meta = {
  title: "Primitives/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Stepper`. Where you are in a sequence of steps.",
      },
    },
  },
  args: {
    width: "26rem",
    items: [{ label: "Pick" }, { label: "Configure" }, { label: "Deploy" }],
    selectedIndex: 1,
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstStep: Story = {
  args: { selectedIndex: 0 },
};

export const Finished: Story = {
  args: { selectedIndex: 2 },
};
