import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextInput, type TextInputVariant } from "@/widgets/inputs/TextInput";
import { Field } from "@/widgets/inputs/Field";
import { Stack } from "../shared";

const VARIANTS: TextInputVariant[] = [
  "Text",
  "Textarea",
  "Email",
  "Tel",
  "Url",
  "Password",
  "Search",
];

const meta = {
  title: "Inputs/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.TextInput`. Ivy's `events` array becomes an `onChange` callback; `invalid`, `nullable`, `density` and `ghost` keep their Ivy names.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { value: "Tendril", width: "18rem" },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return <TextInput {...args} value={value} onChange={(next) => setValue(next ?? "")} nullable />;
  },
};

export const Variants: Story = {
  render: (args) => (
    <Stack>
      <Field label="Search">
        <TextInput {...args} variant="Search" placeholder="Find anything…" value="" nullable />
      </Field>
      <Field label="Password">
        <TextInput {...args} variant="Password" value="hunter2" />
      </Field>
      <Field label="Email" description="We never share it">
        <TextInput {...args} variant="Email" placeholder="you@example.com" value="" />
      </Field>
      <Field label="Textarea">
        <TextInput {...args} variant="Textarea" rows={3} value={"Two\nlines"} />
      </Field>
    </Stack>
  ),
};

export const Invalid: Story = {
  args: { value: "not-a-url", invalid: "Must start with https://" },
};

export const Disabled: Story = {
  args: { disabled: true },
};
