import type { Meta, StoryObj } from "@storybook/react-vite";
import { Embed } from "@/widgets/primitives/Media";

const meta = {
  title: "Primitives/Embed",
  component: Embed,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Embed`. Stands in for third-party content, named by its URL rather than actually loaded.",
      },
    },
  },
  args: { url: "https://youtube.com/watch?v=dQw4w9WgXcQ" },
} satisfies Meta<typeof Embed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
