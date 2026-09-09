import type { Meta, StoryObj } from "@storybook/react-vite";
import { Json } from "@/widgets/primitives/Code";

const meta = {
  title: "Primitives/Json",
  component: Json,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: "Mirrors `Ivy.Json`. Pretty-prints a JSON string." },
    },
  },
  args: {
    content: '{"name":"tendril","version":"0.1.0","tags":["sketch","wireframe"]}',
    width: "20rem",
  },
} satisfies Meta<typeof Json>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
