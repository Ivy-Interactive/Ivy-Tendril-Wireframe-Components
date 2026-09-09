import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResizablePanel, ResizablePanelGroup } from "@/widgets/layouts";
import { List, ListItem } from "@/widgets/Lists";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { WireframePlaceholder } from "@/widgets/wireframe";
import { Frame } from "../shared";

const meta = {
  title: "Layouts/ResizablePanelGroup",
  component: ResizablePanelGroup,
  subcomponents: { ResizablePanel },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.ResizablePanelGroup`, holding `ResizablePanel` children (`Ivy.ResizablePanel`). Drag a seam to move it: whatever one side gains its neighbour gives up, so the panels either side stay put. `defaultSize` accepts `30`, `\"30%\"` or `\"1/3\"`, and panels without one split what is left.",
      },
    },
  },
  argTypes: { direction: { control: "inline-radio", options: ["Horizontal", "Vertical"] } },
  args: { height: "16rem" },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Frame>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={30}>
          <div className="p-3">
            <List>
              <ListItem title="src" icon="Folder" />
              <ListItem title="tests" icon="Folder" />
            </List>
          </div>
        </ResizablePanel>
        <ResizablePanel>
          <div className="h-full p-3">
            <WireframePlaceholder text="Editor" width="100%" height="100%" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <Frame>
      <ResizablePanelGroup {...args} direction="Vertical" showHandle={false}>
        <ResizablePanel defaultSize="2/3">
          <div className="p-3">
            <TextBlock>Drag the seam between the two panels.</TextBlock>
          </div>
        </ResizablePanel>
        <ResizablePanel>
          <div className="h-full p-3">
            <WireframePlaceholder text="Console" width="100%" height="100%" color="Gray" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
};

export const ThreeWay: Story = {
  render: (args) => (
    <Frame>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={25}>
          <div className="p-3">
            <TextBlock>Navigator</TextBlock>
          </div>
        </ResizablePanel>
        <ResizablePanel defaultSize={50}>
          <div className="p-3">
            <TextBlock>Editor</TextBlock>
          </div>
        </ResizablePanel>
        <ResizablePanel defaultSize={25}>
          <div className="p-3">
            <TextBlock>Inspector</TextBlock>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
};
