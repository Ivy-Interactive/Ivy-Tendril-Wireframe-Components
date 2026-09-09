import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeInput } from "@/widgets/inputs/SpecialInputs";

const meta = {
  title: "Inputs/CodeInput",
  component: CodeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.CodeInput`. An editable listing — the same paper stock as `CodeBlock`, but you can type in it.",
      },
    },
  },
  args: {
    language: "ts",
    width: "22rem",
    height: "9rem",
    value: "export function hello(name: string) {\n  return `hi ${name}`;\n}",
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
