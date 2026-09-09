import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateTimeInput, type DateTimeVariant } from "@/widgets/inputs/DateInput";
import { Field } from "@/widgets/inputs/Field";
import { Stack } from "../shared";

const VARIANTS: DateTimeVariant[] = ["Date", "DateTime", "Time", "Month", "Week", "Year"];

const meta = {
  title: "Inputs/DateTimeInput",
  component: DateTimeInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.DateTimeInput`. One control across date, date-and-time, time, month, week and year, with a drawn calendar in the popover.",
      },
    },
  },
  argTypes: { variant: { control: "inline-radio", options: VARIANTS } },
  args: { value: "2026-04-20", width: "16rem" },
} satisfies Meta<typeof DateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <DateTimeInput {...args} value={value} onChange={setValue} nullable />;
  },
};

export const Variants: Story = {
  render: (args) => (
    <Stack width="18rem">
      <Field label="Date & time">
        <DateTimeInput {...args} variant="DateTime" value="2026-04-20T09:30" />
      </Field>
      <Field label="Time">
        <DateTimeInput {...args} variant="Time" value="09:30" />
      </Field>
      <Field label="Month">
        <DateTimeInput {...args} variant="Month" value="2026-04" />
      </Field>
    </Stack>
  ),
};
