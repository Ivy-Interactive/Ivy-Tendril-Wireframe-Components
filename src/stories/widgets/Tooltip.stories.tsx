import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip, type TooltipVariant } from "@/widgets/Menus";
import { Button } from "@/widgets/Button";
import { Row } from "../shared";

const VARIANTS: TooltipVariant[] = ["Default", "Info", "Success", "Warning", "Error"];

const meta = {
  title: "Widgets/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Tooltip`. The bubble is drawn as a sticky note rather than a solid chip.",
      },
    },
  },
  argTypes: { variant: { control: "select", options: VARIANTS } },
  args: { content: "Drawn on a sticky note" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Tooltip {...args} trigger={<Button title="Hover me" variant="Secondary" />} />,
};

export const Variants: Story = {
  render: (args) => (
    <Row>
      {VARIANTS.map((variant) => (
        <Tooltip
          key={variant}
          {...args}
          variant={variant}
          content={`A ${variant.toLowerCase()} note`}
          trigger={<Button title={variant} variant="Outline" />}
        />
      ))}
    </Row>
  ),
};
