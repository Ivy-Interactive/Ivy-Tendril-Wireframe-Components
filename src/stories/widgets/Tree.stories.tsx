import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tree } from "@/widgets/Menus";
import { menuItems, treeItems } from "../data";

const meta = {
  title: "Widgets/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Tree`. Nested `MenuItem`s, with `expanded` deciding what starts open and `rowActions` hanging a menu off each row.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { items: treeItems, width: "16rem" },
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRowActions: Story = {
  args: { rowActions: menuItems },
};
