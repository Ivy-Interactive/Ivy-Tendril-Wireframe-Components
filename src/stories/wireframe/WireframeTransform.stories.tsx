import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeCallout, WireframeNote, WireframePlaceholder, WireframeTransform } from "@/widgets/wireframe";
import { Badge } from "@/widgets/Badge";
import { Button } from "@/widgets/Button";
import { Card } from "@/widgets/Card";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeTransform",
  component: WireframeTransform,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeTransform`. Rotates, scales, skews, flips or nudges its children. The transform is visual only — children keep the layout box they started with, so a rotated child does not push its neighbours around. Turn `fit` on when the transformed bounds should take up room.",
      },
    },
  },
  argTypes: {
    origin: {
      control: "select",
      options: [
        "Center",
        "TopLeft",
        "Top",
        "TopRight",
        "Left",
        "Right",
        "BottomLeft",
        "Bottom",
        "BottomRight",
      ],
    },
  },
  args: { rotate: -2.5 },
} satisfies Meta<typeof WireframeTransform>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <WireframeTransform {...args}>
      <WireframeNote text="Pinned up crooked, the way a note actually lands." />
    </WireframeTransform>
  ),
};

export const Transforms: Story = {
  render: () => (
    <Row>
      <WireframeTransform rotate={-2.5}>
        <WireframeNote text="Rotated" />
      </WireframeTransform>
      <WireframeTransform scale={0.75} fit>
        <Card title="Scaled to three quarters" width="16rem">
          With <code>fit</code>, the box shrinks to what the child covers.
        </Card>
      </WireframeTransform>
      <WireframeTransform skewX={-8} opacity={0.6}>
        <Button title="Skewed and faded" variant="Outline" />
      </WireframeTransform>
      <WireframeTransform flipHorizontal>
        <Badge title="Mirrored" variant="Info" />
      </WireframeTransform>
    </Row>
  ),
};

export const OnASketch: Story = {
  render: () => (
    <Row>
      <div className="relative">
        <WireframeTransform rotate={-1.5}>
          <Card title="Checkout" width="18rem">
            <div className="flex flex-col gap-2">
              <WireframePlaceholder text="Card details" width="100%" height="3rem" />
              <Button title="Pay" />
            </div>
          </Card>
        </WireframeTransform>
        <WireframeCallout label="1" leader={50} className="absolute top-4 -right-40">
          Needs a total
        </WireframeCallout>
      </div>
    </Row>
  ),
};
