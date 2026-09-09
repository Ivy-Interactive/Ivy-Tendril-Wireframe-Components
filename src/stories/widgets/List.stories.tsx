import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItem } from "@/widgets/Lists";

const meta = {
  title: "Widgets/List",
  component: List,
  subcomponents: { ListItem },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.List`, holding `ListItem` children (`Ivy.ListItem`). Each item takes a title, subtitle, icon and badge.",
      },
    },
  },
  args: { width: "18rem" },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <List {...args}>
      <ListItem title="Inbox" subtitle="12 unread" icon="Inbox" badge="12" onClick={() => {}} />
      <ListItem title="Drafts" subtitle="2 drafts" icon="FileText" onClick={() => {}} />
      <ListItem title="Archive" icon="Archive" disabled />
    </List>
  ),
};

export const Plain: Story = {
  render: (args) => (
    <List {...args}>
      <ListItem title="Search" />
      <ListItem title="Filters" />
      <ListItem title="Saved views" />
    </List>
  ),
};
