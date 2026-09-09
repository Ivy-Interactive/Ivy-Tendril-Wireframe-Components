import type { Meta, StoryObj } from "@storybook/react-vite";
import { CameraInput } from "@/widgets/inputs/SpecialInputs";

const meta = {
  title: "Inputs/CameraInput",
  component: CameraInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.CameraInput`. A viewfinder frame with a shutter button.",
      },
    },
  },
  args: { width: "16rem" },
} satisfies Meta<typeof CameraInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
