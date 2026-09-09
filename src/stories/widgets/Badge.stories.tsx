import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, type BadgeVariant } from "@/widgets/Badge";
import { Row } from "../shared";

const VARIANTS: BadgeVariant[] = [
  "Primary",
  "Secondary",
  "Destructive",
  "Outline",
  "Success",
  "Warning",
  "Info",
];

const meta = {
  title: "Widgets/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Badge`. A small status marker, drawn as a pill in the sketch hand.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { title: "Badge", variant: "Primary" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Row>
      {VARIANTS.map((variant) => (
        <Badge key={variant} {...args} variant={variant} title={variant} icon="Star" />
      ))}
    </Row>
  ),
};

export const Densities: Story = {
  render: (args) => (
    <Row>
      <Badge {...args} density="Small" title="Small" />
      <Badge {...args} density="Medium" title="Medium" />
      <Badge {...args} density="Large" title="Large" />
    </Row>
  ),
};

export const CustomColour: Story = {
  render: (args) => (
    <Row>
      <Badge {...args} color="Violet" title="Violet" />
      <Badge {...args} color="Teal" title="Teal" />
      <Badge {...args} color="Rose" title="Rose" icon="Heart" />
    </Row>
  ),
};
