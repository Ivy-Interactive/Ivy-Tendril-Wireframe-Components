import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BoolInput } from "@/widgets/inputs/BoolInput";
import { Stack } from "../shared";

const meta = {
  title: "Inputs/BoolInput",
  component: BoolInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.BoolInput`. `nullable` makes the checkbox tri-state, cycling true → null → false.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["Checkbox", "Switch", "Toggle"] },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { label: "Notify the team", variant: "Checkbox", value: true },
} satisfies Meta<typeof BoolInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<boolean | null>(args.value ?? false);
    return <BoolInput {...args} value={value} onChange={setValue} />;
  },
};

export const Variants: Story = {
  render: (args) => (
    <Stack>
      <BoolInput
        {...args}
        variant="Checkbox"
        label="Tri-state checkbox"
        description="Cycles true → null → false"
        nullable
      />
      <BoolInput {...args} variant="Switch" label="Switch" />
      <BoolInput {...args} variant="Toggle" label="Bold" icon="Bold" />
    </Stack>
  ),
};

export const States: Story = {
  render: (args) => (
    <Stack>
      <BoolInput {...args} label="Disabled" disabled />
      <BoolInput {...args} label="Loading" loading />
    </Stack>
  ),
};
