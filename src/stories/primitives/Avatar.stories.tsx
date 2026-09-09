import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@/widgets/primitives/Misc";
import { Row } from "../shared";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Avatar`. Initials in a drawn circle, standing in for a person.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { fallback: "NB" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Group: Story = {
  render: (args) => (
    <Row>
      <Avatar {...args} fallback="NB" density="Small" />
      <Avatar {...args} fallback="AB" color="Blue" />
      <Avatar {...args} fallback="XY" color="Green" density="Large" />
    </Row>
  ),
};
