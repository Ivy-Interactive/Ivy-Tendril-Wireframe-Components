import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeedbackInput } from "@/widgets/inputs/SpecialInputs";
import { Field } from "@/widgets/inputs/Field";
import { Stack } from "../shared";

const meta = {
  title: "Inputs/FeedbackInput",
  component: FeedbackInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.FeedbackInput`. Stars, thumbs or emojis — `allowHalf` lets a star rating land between two values.",
      },
    },
  },
  argTypes: { variant: { control: "inline-radio", options: ["Stars", "Thumbs", "Emojis"] } },
  args: { value: 4 },
} satisfies Meta<typeof FeedbackInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Stack width="18rem">
      <Field label="Stars">
        <FeedbackInput {...args} />
      </Field>
      <Field label="Half stars">
        <FeedbackInput {...args} value={3.5} allowHalf />
      </Field>
      <Field label="Thumbs">
        <FeedbackInput {...args} variant="Thumbs" value />
      </Field>
      <Field label="Emojis">
        <FeedbackInput {...args} variant="Emojis" />
      </Field>
    </Stack>
  ),
};
