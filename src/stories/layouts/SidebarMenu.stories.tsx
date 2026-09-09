import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarMenu } from "@/widgets/layouts";
import { menuItems, treeItems } from "../data";

const meta = {
  title: "Layouts/SidebarMenu",
  component: SidebarMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.SidebarMenu`. The navigation list that usually fills a `SidebarLayout`'s sidebar. Filtering keeps a group whose own label matches, and otherwise only the children that match — so a search never hides the branch it found.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { items: menuItems, width: "16rem" },
} satisfies Meta<typeof SidebarMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: { searchActive: true },
};

export const Nested: Story = {
  args: { items: treeItems, searchActive: true },
};
