import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangeInput, type DateRangeValue } from "@/widgets/inputs/DateInput";
import { Field } from "@/widgets/inputs/Field";

const meta = {
  title: "Inputs/DateRangeInput",
  component: DateRangeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.DateRangeInput`. The value is Ivy's `{ item1, item2 }` pair — the start and end of the range.",
      },
    },
  },
  args: { value: { item1: "2026-04-05", item2: "2026-04-18" }, width: "20rem" },
} satisfies Meta<typeof DateRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<DateRangeValue | null>(args.value ?? null);
    return (
      <Field label="Date range" width="22rem">
        <DateRangeInput {...args} value={value} onChange={setValue} />
      </Field>
    );
  },
};
