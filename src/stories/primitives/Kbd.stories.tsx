import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "@/widgets/primitives/Misc";
import { Row } from "../shared";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Kbd`. A keycap, for naming a shortcut in prose.",
      },
    },
  },
  args: { content: "K" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Chord: Story = {
  render: (args) => (
    <Row>
      <span className="flex items-center gap-1">
        <Kbd {...args} content="⌘" />
        <Kbd {...args} content="K" />
      </span>
      <span className="flex items-center gap-1">
        <Kbd {...args} content="Ctrl" />
        <Kbd {...args} content="Shift" />
        <Kbd {...args} content="P" />
      </span>
    </Row>
  ),
};
