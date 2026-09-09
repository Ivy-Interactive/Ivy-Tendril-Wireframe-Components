import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeNote } from "@/widgets/wireframe";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeNote",
  component: WireframeNote,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeNote`. A sticky note pinned to the sketch, tilted very slightly so it reads as paper rather than a panel.",
      },
    },
  },
  args: { text: "Remember: this whole screen is a sketch, not a spec." },
} satisfies Meta<typeof WireframeNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Colours: Story = {
  render: (args) => (
    <Row>
      <WireframeNote {...args} text="Amber is the default." />
      <WireframeNote {...args} text="Blue notes for open questions." color="Sky" />
      <WireframeNote {...args} text="Green for a decision made." color="Green" />
      <WireframeNote {...args} text="Red for a blocker." color="Red" />
    </Row>
  ),
};
