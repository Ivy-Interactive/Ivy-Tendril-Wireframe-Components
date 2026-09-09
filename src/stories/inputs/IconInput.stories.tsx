import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconInput } from "@/widgets/inputs/SpecialInputs";
import { Field } from "@/widgets/inputs/Field";

const meta = {
  title: "Inputs/IconInput",
  component: IconInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.IconInput`. A searchable picker over the Lucide icon set.",
      },
    },
  },
  args: { value: "Rocket", nullable: true },
} satisfies Meta<typeof IconInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field label="Icon" width="18rem">
      <IconInput {...args} />
    </Field>
  ),
};
