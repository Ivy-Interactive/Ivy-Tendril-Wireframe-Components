import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@/widgets/DataTable";
import { menuItems, people } from "../data";

const columns = [
  { name: "name", header: "Name", icon: "User" },
  {
    name: "role",
    header: "Role",
    colType: "Badge" as const,
    badgeColorMapping: { Admin: "Destructive", Editor: "Blue", Viewer: "Slate" },
  },
  {
    name: "score",
    header: "Score",
    colType: "Number" as const,
    alignContent: "Right" as const,
    footer: ["Σ 414"],
  },
  { name: "joined", header: "Joined", colType: "Date" as const },
  { name: "active", header: "Active", colType: "Boolean" as const, alignContent: "Center" as const },
];

const meta = {
  title: "Widgets/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.DataTable`. Rows and columns arrive as data; `colType` decides how a cell is drawn, and `config` carries paging, sorting and selection.",
      },
    },
  },
  args: { width: "42rem", columns, rows: people },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Paged: Story = {
  args: { config: { pageSize: 3 } },
};

export const SelectableWithRowActions: Story = {
  args: { config: { pageSize: 3, selectionMode: "Multiple" }, rowActions: menuItems },
};
