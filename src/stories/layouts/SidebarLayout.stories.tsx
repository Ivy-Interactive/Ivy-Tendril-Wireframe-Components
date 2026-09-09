import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarLayout, SidebarMenu } from "@/widgets/layouts";
import { Badge } from "@/widgets/Badge";
import { Button } from "@/widgets/Button";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { WireframePlaceholder } from "@/widgets/wireframe";
import { menuItems } from "../data";
import { Frame } from "../shared";

const meta = {
  title: "Layouts/SidebarLayout",
  component: SidebarLayout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.SidebarLayout`. The application shell: a collapsible sidebar beside a main content area, with six slots and optional drag-to-resize between 200px and 600px.",
      },
    },
  },
  argTypes: {
    sidebarContentScroll: {
      control: "inline-radio",
      options: ["None", "Auto", "Vertical", "Horizontal", "Both"],
    },
  },
  args: {
    height: "22rem",
    sidebarHeader: <TextBlock variant="H4">Ivy</TextBlock>,
    sidebarContent: <SidebarMenu items={menuItems} onSelect={() => {}} />,
    mainContent: (
      <div className="flex flex-col gap-3">
        <TextBlock variant="H3">Dashboard</TextBlock>
        <WireframePlaceholder text="Charts" width="100%" height="8rem" />
      </div>
    ),
  },
} satisfies Meta<typeof SidebarLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Frame>
      <SidebarLayout {...args} />
    </Frame>
  ),
};

export const FullShell: Story = {
  render: (args) => (
    <Frame>
      <SidebarLayout
        {...args}
        resizable
        mainAppSidebar
        sidebarHeaderCollapsed={<Badge title="I" density="Small" />}
        sidebarFooter={<Button title="Sign out" variant="Ghost" density="Small" icon="LogOut" />}
        sidebarContent={<SidebarMenu items={menuItems} searchActive onSelect={() => {}} />}
      />
    </Frame>
  ),
};

export const Collapsed: Story = {
  render: (args) => (
    <Frame>
      <SidebarLayout
        {...args}
        defaultOpen={false}
        sidebarHeaderCollapsed={<Badge title="I" density="Small" />}
      />
    </Frame>
  ),
};
