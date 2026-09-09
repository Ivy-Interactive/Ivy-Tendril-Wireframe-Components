import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioInput } from "@/widgets/inputs/SpecialInputs";
import { Row } from "../shared";

const meta = {
  title: "Inputs/AudioInput",
  component: AudioInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.AudioInput`. The recording state, with the elapsed time and a drawn level trace.",
      },
    },
  },
  args: { recording: true, elapsed: 2 },
} satisfies Meta<typeof AudioInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recording: Story = {};

export const Idle: Story = {
  render: (args) => (
    <Row>
      <AudioInput {...args} recording={false} elapsed={0} />
    </Row>
  ),
};
