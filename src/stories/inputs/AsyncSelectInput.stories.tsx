import type { Meta, StoryObj } from "@storybook/react-vite";
import { AsyncSelectInput } from "@/widgets/inputs/SelectInput";
import { Field } from "@/widgets/inputs/Field";
import { options } from "../data";

const meta = {
  title: "Inputs/AsyncSelectInput",
  component: AsyncSelectInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.AsyncSelectInput`. The same surface as `SelectInput`, but the options are fetched as the user types — `displayValue` is what shows before they do.",
      },
    },
  },
  args: { displayValue: "Design", options, width: "18rem" },
} satisfies Meta<typeof AsyncSelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field label="Async" width="20rem">
      <AsyncSelectInput {...args} />
    </Field>
  ),
};
