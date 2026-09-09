import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeScratchOut } from "@/widgets/wireframe";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeScratchOut",
  component: WireframeScratchOut,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeScratchOut`. Three overlapping zigzag passes, each offset by a third of a column — one pass on its own reads as a tidy spring rather than something scribbled over.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { width: "12rem", height: "3rem" },
} satisfies Meta<typeof WireframeScratchOut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OverContent: Story = {
  render: (args) => (
    <Row>
      <div className="relative">
        <TextBlock width="16rem">This copy did not survive the review.</TextBlock>
        <WireframeScratchOut
          {...args}
          className="absolute inset-0"
          width="100%"
          height="100%"
          density="Small"
        />
      </div>
    </Row>
  ),
};

export const Colours: Story = {
  render: (args) => (
    <Row>
      <WireframeScratchOut {...args} />
      <WireframeScratchOut {...args} color="Red" />
      <WireframeScratchOut {...args} color="Blue" density="Large" />
    </Row>
  ),
};
