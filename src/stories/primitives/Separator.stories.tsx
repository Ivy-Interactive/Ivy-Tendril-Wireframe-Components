import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "@/widgets/primitives/Separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Separator`. A drawn rule, optionally with a label set into it.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["Horizontal", "Vertical"] },
    textAlign: { control: "inline-radio", options: ["Left", "Center", "Right"] },
  },
  args: {},
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Separator {...args} />
    </div>
  ),
};

export const Labelled: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      <Separator {...args} text="Centred" />
      <Separator {...args} text="Left" textAlign="Left" />
      <Separator {...args} text="Right" textAlign="Right" />
    </div>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <div className="flex h-12 items-center gap-4">
      <span>Before</span>
      <Separator {...args} orientation="Vertical" />
      <span>After</span>
    </div>
  ),
};
