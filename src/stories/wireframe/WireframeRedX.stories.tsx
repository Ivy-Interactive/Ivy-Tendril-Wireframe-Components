import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeRedX } from "@/widgets/wireframe";
import { Card } from "@/widgets/Card";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeRedX",
  component: WireframeRedX,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeRedX`. A marker X struck over a region — this part is wrong, or cut. The weight scales gently with the box, so a small X is not hairline and a large one is not a blob.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { width: "12rem", height: "6rem" },
} satisfies Meta<typeof WireframeRedX>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OverContent: Story = {
  render: (args) => (
    <Row>
      <div className="relative">
        <Card title="Cut this panel" width="16rem">
          The X sits over whatever it is struck through.
        </Card>
        <WireframeRedX {...args} className="absolute inset-0" width="100%" height="100%" />
      </div>
    </Row>
  ),
};

export const Densities: Story = {
  render: (args) => (
    <Row>
      <WireframeRedX {...args} width="8rem" height="8rem" density="Small" />
      <WireframeRedX {...args} width="8rem" height="8rem" density="Medium" />
      <WireframeRedX {...args} width="8rem" height="8rem" density="Large" color="Black" />
    </Row>
  ),
};
