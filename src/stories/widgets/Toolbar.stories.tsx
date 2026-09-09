import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toolbar } from "@/widgets/Menus";
import { menuItems } from "../data";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Toolbar`. A row of `MenuItem`s: `checked` marks a pressed button, `Separator` breaks the row into groups, and an item with `children` opens a menu.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: {
    items: [
      { label: "Bold", icon: "Bold", checked: true },
      { label: "Italic", icon: "Italic" },
      { label: "Underline", icon: "Underline" },
      { label: "sep", variant: "Separator" },
      { label: "More", icon: "Ellipsis", children: menuItems },
    ],
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Densities: Story = {
  render: (args) => (
    <Stack width="30rem">
      <Toolbar {...args} density="Small" />
      <Toolbar {...args} density="Medium" />
      <Toolbar {...args} density="Large" />
    </Stack>
  ),
};
