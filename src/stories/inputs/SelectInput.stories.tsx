import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { NullableSelectValue } from "@/lib/types";
import { SelectInput, type SelectVariant } from "@/widgets/inputs/SelectInput";
import { Field } from "@/widgets/inputs/Field";
import { options } from "../data";
import { Stack } from "../shared";

const VARIANTS: SelectVariant[] = ["Select", "List", "Toggle", "Slider", "Radio"];

const meta = {
  title: "Inputs/SelectInput",
  component: SelectInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.SelectInput`. One control, five shapes — the same `Option[]` renders as a dropdown, a list, a toggle group, a slider or a radio group.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { options, value: "build", width: "18rem" },
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<NullableSelectValue>(args.value);
    return <SelectInput {...args} value={value} onChange={setValue} nullable />;
  },
};

export const Variants: Story = {
  render: (args) => (
    <Stack width="20rem">
      <Field label="Radio">
        <SelectInput {...args} variant="Radio" />
      </Field>
      <Field label="Toggle group">
        <SelectInput {...args} variant="Toggle" />
      </Field>
      <Field label="List">
        <SelectInput {...args} variant="List" width="14rem" />
      </Field>
      <Field label="Slider">
        <SelectInput {...args} variant="Slider" width="16rem" />
      </Field>
    </Stack>
  ),
};

export const MultiSelect: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<NullableSelectValue>(["design", "build"]);
    return (
      <Field label="Multi select" width="20rem">
        <SelectInput {...args} value={value} selectMany showActions onChange={setValue} />
      </Field>
    );
  },
};
