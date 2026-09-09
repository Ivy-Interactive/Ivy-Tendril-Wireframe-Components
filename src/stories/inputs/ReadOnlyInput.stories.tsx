import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReadOnlyInput } from "@/widgets/inputs/TextInput";

const meta = {
  title: "Inputs/ReadOnlyInput",
  component: ReadOnlyInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.ReadOnlyInput`. A value shown in an input's clothing — for an id or a generated key that can be copied but not edited.",
      },
    },
  },
  args: { value: "tendril-a1b2c3", width: "18rem" },
} satisfies Meta<typeof ReadOnlyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCopyButton: Story = {
  args: { showCopyButton: true },
};
