import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextBlock, type TextBlockVariant } from "@/widgets/primitives/TextBlock";

const VARIANTS: TextBlockVariant[] = [
  "Display",
  "H1",
  "H2",
  "H3",
  "H4",
  "Lead",
  "P",
  "Blockquote",
  "Muted",
  "Danger",
  "Success",
  "Monospaced",
];

const meta = {
  title: "Primitives/TextBlock",
  component: TextBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.TextBlock`. Every piece of prose in the library goes through it, so the whole sheet stays in one hand.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    textAlignment: { control: "inline-radio", options: ["Left", "Center", "Right", "Justify"] },
  },
  args: { content: "The quick brown fox", variant: "P" },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      {VARIANTS.map((variant) => (
        <TextBlock key={variant} {...args} variant={variant} content={`${variant} — the quick brown fox`} />
      ))}
    </div>
  ),
};

export const Emphasis: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <TextBlock {...args} content="Bold" bold />
      <TextBlock {...args} content="Struck through" strikeThrough />
      <TextBlock {...args} content="Struck through and bold" strikeThrough bold />
    </div>
  ),
};
