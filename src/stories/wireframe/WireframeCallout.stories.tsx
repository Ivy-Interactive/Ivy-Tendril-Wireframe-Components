import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeCallout } from "@/widgets/wireframe";
import { Stack } from "../shared";

const meta = {
  title: "Wireframe/WireframeCallout",
  component: WireframeCallout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeCallout`. A numbered marker for keying a sketch to a list of notes; `leader` draws a line pointing off to the right.",
      },
    },
  },
  args: { label: "1", leader: 70, children: "Primary action" },
} satisfies Meta<typeof WireframeCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Keyed: Story = {
  render: (args) => (
    <Stack>
      <WireframeCallout {...args} label="1">
        Primary action
      </WireframeCallout>
      <WireframeCallout {...args} label="2" color="Blue">
        Secondary path
      </WireframeCallout>
      <WireframeCallout {...args} label="3" color="Green">
        Confirmation
      </WireframeCallout>
    </Stack>
  ),
};

export const MarkerOnly: Story = {
  args: { leader: undefined, children: undefined },
};
