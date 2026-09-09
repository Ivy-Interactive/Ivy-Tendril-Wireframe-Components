import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorInput, type ColorInputVariant } from "@/widgets/inputs/SpecialInputs";
import { Field } from "@/widgets/inputs/Field";
import { Stack } from "../shared";

const VARIANTS: ColorInputVariant[] = ["Text", "Picker", "TextAndPicker", "Swatch", "SwatchPicker"];

const meta = {
  title: "Inputs/ColorInput",
  component: ColorInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.ColorInput`. The swatch variants offer the Ivy colour names; the text variants take any CSS colour.",
      },
    },
  },
  argTypes: { variant: { control: "select", options: VARIANTS } },
  args: { value: "Teal", variant: "SwatchPicker" },
} satisfies Meta<typeof ColorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<string | null>(args.value ?? null);
    return <ColorInput {...args} value={value} onChange={setValue} />;
  },
};

export const Variants: Story = {
  render: (args) => (
    <Stack width="18rem">
      {VARIANTS.map((variant) => (
        <Field key={variant} label={variant}>
          <ColorInput {...args} variant={variant} />
        </Field>
      ))}
    </Stack>
  ),
};
