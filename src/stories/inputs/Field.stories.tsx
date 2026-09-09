import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "@/widgets/inputs/Field";
import { TextInput } from "@/widgets/inputs/TextInput";
import { Stack } from "../shared";

const meta = {
  title: "Inputs/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Field`. Wraps any input with its label, description, help text and required marker, so every control in a form lines up the same way.",
      },
    },
  },
  args: { label: "Project", width: "20rem" },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <TextInput value="Tendril" width="100%" />
    </Field>
  ),
};

export const Annotations: Story = {
  render: (args) => (
    <Stack>
      <Field {...args} required>
        <TextInput value="Tendril" width="100%" />
      </Field>
      <Field {...args} label="Slug" description="Lower case, no spaces">
        <TextInput value="tendril" width="100%" />
      </Field>
      <Field {...args} label="Owner" help="Shown in the sidebar">
        <TextInput value="Ada" width="100%" />
      </Field>
    </Stack>
  ),
};
