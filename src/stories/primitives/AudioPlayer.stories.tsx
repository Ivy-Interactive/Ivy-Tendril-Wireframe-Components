import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioPlayer } from "@/widgets/primitives/Media";

const meta = {
  title: "Primitives/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Mirrors `Ivy.AudioPlayer`. Transport controls drawn by hand." },
    },
  },
  args: { src: "" },
} satisfies Meta<typeof AudioPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
