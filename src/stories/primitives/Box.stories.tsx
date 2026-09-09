import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@/widgets/primitives/Box";
import { Row } from "../shared";

const meta = {
  title: "Primitives/Box",
  component: Box,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Box`. The general-purpose sketched container — a border, a fill and content alignment.",
      },
    },
  },
  argTypes: {
    borderRadius: { control: "inline-radio", options: ["None", "Rounded", "Full"] },
    borderStyle: { control: "inline-radio", options: ["None", "Solid", "Dashed", "Dotted"] },
    hoverVariant: {
      control: "inline-radio",
      options: ["None", "Pointer", "PointerAndTranslate", "Shadow"],
    },
  },
  args: { width: "10rem", height: "6rem", children: "Box" },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Borders: Story = {
  render: (args) => (
    <Row>
      <Box {...args}>Rounded</Box>
      <Box {...args} borderRadius="None" borderStyle="Dashed">
        Dashed
      </Box>
      <Box {...args} borderStyle="Dotted">
        Dotted
      </Box>
      <Box {...args} width="6rem" borderRadius="Full" background="Amber">
        Full
      </Box>
    </Row>
  ),
};

export const Hover: Story = {
  render: (args) => (
    <Row>
      <Box {...args} background="White" hoverVariant="Shadow">
        Shadow
      </Box>
      <Box {...args} background="White" hoverVariant="PointerAndTranslate">
        Lift
      </Box>
    </Row>
  ),
};
