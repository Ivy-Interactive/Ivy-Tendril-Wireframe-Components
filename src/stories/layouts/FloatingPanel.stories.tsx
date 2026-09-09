import type { Meta, StoryObj } from "@storybook/react-vite";
import { FloatingPanel } from "@/widgets/layouts";
import { Badge } from "@/widgets/Badge";
import { Button } from "@/widgets/Button";
import { Card } from "@/widgets/Card";
import { Frame } from "../shared";

const meta = {
  title: "Layouts/FloatingPanel",
  component: FloatingPanel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.FloatingPanel`. A panel floating above everything else — a tool palette, a floating action button, a status pill. `contained` floats it within the nearest positioned ancestor instead of the viewport, which is how these stories keep it on the page.",
      },
    },
  },
  argTypes: {
    alignSelf: {
      control: "select",
      options: [
        "TopLeft",
        "TopCenter",
        "TopRight",
        "Left",
        "Center",
        "Right",
        "BottomLeft",
        "BottomCenter",
        "BottomRight",
      ],
    },
  },
  args: { contained: true, alignSelf: "BottomRight" },
} satisfies Meta<typeof FloatingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Frame>
      <div className="relative h-64">
        <Card title="Page content" className="m-4" width="20rem">
          The panel floats over whatever is behind it.
        </Card>
        <FloatingPanel {...args}>
          <Button title="New" icon="Plus" />
        </FloatingPanel>
      </div>
    </Frame>
  ),
};

export const Anchors: Story = {
  render: (args) => (
    <Frame>
      <div className="relative h-64">
        <FloatingPanel {...args} alignSelf="TopCenter">
          <Badge title="Saving…" variant="Info" icon="Loader" />
        </FloatingPanel>
        <FloatingPanel {...args} alignSelf="BottomRight">
          <Button title="New" icon="Plus" />
        </FloatingPanel>
        <FloatingPanel {...args} alignSelf="BottomLeft" offset={{ left: 2 }}>
          <Button title="Help" variant="Outline" icon="CircleHelp" density="Small" />
        </FloatingPanel>
      </div>
    </Frame>
  ),
};
