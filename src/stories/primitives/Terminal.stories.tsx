import type { Meta, StoryObj } from "@storybook/react-vite";
import { Terminal } from "@/widgets/primitives/Code";

const meta = {
  title: "Primitives/Terminal",
  component: Terminal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Terminal`. A transcript of commands and their output, on sunken paper. `isCommand` marks the lines that were typed.",
      },
    },
  },
  args: {
    width: "22rem",
    lines: [
      { content: "npm install @ivy/tendril", isCommand: true },
      { content: "added 12 packages in 3s" },
    ],
  },
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Session: Story = {
  args: {
    lines: [
      { content: "npm run build", isCommand: true },
      { content: "vite v6.4.3 building for production..." },
      { content: "✓ 65 modules transformed." },
      { content: "npm run manifest", isCommand: true },
      { content: "manifest: 112 components" },
    ],
  },
};
