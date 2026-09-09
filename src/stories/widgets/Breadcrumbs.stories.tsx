import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "@/widgets/Navigation";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Breadcrumbs`. The trail of parent pages; the last crumb is the current page and is not clickable.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: {
    items: [{ label: "Home", icon: "House" }, { label: "Projects" }, { label: "Tendril" }],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomSeparator: Story = {
  args: { separator: "/" },
};

export const Densities: Story = {
  render: (args) => (
    <Stack width="28rem">
      <Breadcrumbs {...args} density="Small" />
      <Breadcrumbs {...args} density="Medium" />
      <Breadcrumbs {...args} density="Large" />
    </Stack>
  ),
};
