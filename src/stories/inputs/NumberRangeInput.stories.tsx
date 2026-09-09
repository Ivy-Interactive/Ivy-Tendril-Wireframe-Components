import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberRangeInput } from "@/widgets/inputs/NumberInput";
import { Field } from "@/widgets/inputs/Field";

const meta = {
  title: "Inputs/NumberRangeInput",
  component: NumberRangeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.NumberRangeInput`. Two handles on one drawn track, for a lower and an upper bound.",
      },
    },
  },
  args: { lowerValue: 20, upperValue: 70, width: "20rem" },
} satisfies Meta<typeof NumberRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field label="Range" width="22rem">
      <NumberRangeInput {...args} width="100%" />
    </Field>
  ),
};
