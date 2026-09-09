import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoPlayer } from "@/widgets/primitives/Media";

const meta = {
  title: "Primitives/VideoPlayer",
  component: VideoPlayer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.VideoPlayer`. A framed stage with drawn transport controls.",
      },
    },
  },
  args: { source: null, width: "18rem", height: "10rem" },
} satisfies Meta<typeof VideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
