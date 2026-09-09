import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "@/widgets/inputs/NumberInput";
import { Field } from "@/widgets/inputs/Field";
import { Stack } from "../shared";

const meta = {
  title: "Inputs/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.NumberInput`. `formatStyle` covers the whole Ivy set — decimal, currency, percent, compact, scientific, engineering, accounting and bytes.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["Number", "Slider"] },
    formatStyle: {
      control: "select",
      options: [
        "Decimal",
        "Currency",
        "Percent",
        "Compact",
        "Scientific",
        "Engineering",
        "Accounting",
        "Bytes",
      ],
    },
  },
  args: { value: 42, width: "18rem" },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(args.value ?? 0);
    return <NumberInput {...args} value={value} onChange={setValue} nullable />;
  },
};

export const Formats: Story = {
  render: (args) => (
    <Stack>
      <Field label="Currency">
        <NumberInput {...args} value={1299.5} formatStyle="Currency" currency="EUR" precision={2} />
      </Field>
      <Field label="Percent">
        <NumberInput {...args} value={0.62} formatStyle="Percent" precision={0} />
      </Field>
      <Field label="Bytes">
        <NumberInput {...args} value={4823400} formatStyle="Bytes" />
      </Field>
    </Stack>
  ),
};

export const Slider: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<number | null>(42);
    return (
      <Field label="Slider" width="20rem">
        <NumberInput
          {...args}
          variant="Slider"
          value={value}
          min={0}
          max={100}
          onChange={setValue}
          width="100%"
        />
      </Field>
    );
  },
};
