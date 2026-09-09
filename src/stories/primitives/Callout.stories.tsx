import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout, type CalloutVariant } from "@/widgets/primitives/Callout";

const VARIANTS: CalloutVariant[] = ["Info", "Success", "Warning", "Error"];

const meta = {
  title: "Primitives/Callout",
  component: Callout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Callout`. A boxed aside for something the reader needs to know.",
      },
    },
  },
  argTypes: { variant: { control: "inline-radio", options: VARIANTS } },
  args: {
    title: "Heads up",
    variant: "Info",
    width: "24rem",
    children: "A short explanation of what just happened.",
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <Callout key={variant} {...args} variant={variant} title={variant} />
      ))}
    </div>
  ),
};
