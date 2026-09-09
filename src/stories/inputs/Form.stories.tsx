import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Form } from "@/widgets/inputs/Field";
import { TextInput } from "@/widgets/inputs/TextInput";
import { NumberInput } from "@/widgets/inputs/NumberInput";
import { SelectInput } from "@/widgets/inputs/SelectInput";
import { BoolInput } from "@/widgets/inputs/BoolInput";
import { Button } from "@/widgets/Button";
import { options } from "../data";

const meta = {
  title: "Inputs/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Form`. Lays out a column of `Field`s with consistent spacing.",
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Form {...args} onSubmit={() => {}} className="w-96">
      <Field label="Project" required help="Shown in the sidebar">
        <TextInput value="Tendril" width="100%" />
      </Field>
      <Field label="Stage">
        <SelectInput options={options} value="build" width="100%" />
      </Field>
      <Field label="Budget">
        <NumberInput value={25000} formatStyle="Currency" width="100%" />
      </Field>
      <Field label="Notes" description="Markdown is fine">
        <TextInput variant="Textarea" rows={3} width="100%" />
      </Field>
      <BoolInput variant="Checkbox" label="Notify the team" value />
      <div className="flex justify-end gap-2">
        <Button variant="Ghost" title="Cancel" />
        <Button title="Save project" icon="Save" />
      </div>
    </Form>
  ),
};
