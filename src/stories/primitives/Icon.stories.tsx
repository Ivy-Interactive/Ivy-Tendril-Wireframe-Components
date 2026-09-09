import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "@/widgets/primitives/Misc";
import { Row } from "../shared";

const NAMES = ["Rocket", "Heart", "Star", "House", "Bell", "Search", "Trash2", "Save"];

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Icon`. Lucide icons pushed through a turbulence filter, so they read as sketched rather than vector-crisp.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { name: "Rocket" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Gallery: Story = {
  render: (args) => (
    <Row>
      {NAMES.map((name) => (
        <Icon key={name} {...args} name={name} />
      ))}
    </Row>
  ),
};

export const ColoursAndSizes: Story = {
  render: (args) => (
    <Row>
      <Icon {...args} name="Heart" color="Rose" density="Large" />
      <Icon {...args} name="Star" color="Amber" />
      <Icon {...args} name="Bell" density="Small" />
    </Row>
  ),
};
