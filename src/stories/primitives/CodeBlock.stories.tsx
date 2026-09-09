import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "@/widgets/primitives/Code";

const meta = {
  title: "Primitives/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.CodeBlock`. A listing on its own paper stock, with optional line numbers.",
      },
    },
  },
  args: {
    language: "tsx",
    width: "26rem",
    content: 'const button = <Button title="Save" icon="Save" />;\nrender(button);',
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLineNumbers: Story = {
  args: { showLineNumbers: true },
};
