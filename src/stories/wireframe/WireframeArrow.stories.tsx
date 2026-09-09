import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeArrow, type ArrowDirection } from "@/widgets/wireframe";
import { Row } from "../shared";

const DIRECTIONS: ArrowDirection[] = [
  "Right",
  "Left",
  "Up",
  "Down",
  "UpLeft",
  "UpRight",
  "DownLeft",
  "DownRight",
];

const meta = {
  title: "Wireframe/WireframeArrow",
  component: WireframeArrow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeArrow`. The shaft is a rough curve through a quadratic bend, and the barbs aim along its last stretch — so a bent arrow's head follows the curve round rather than pointing at the corner of the box.",
      },
    },
  },
  argTypes: {
    direction: { control: "select", options: DIRECTIONS },
    heads: { control: "inline-radio", options: ["None", "Start", "End", "Both"] },
    bend: { control: "inline-radio", options: ["None", "Left", "Right"] },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { direction: "Right", heads: "End", bend: "None", width: "10rem" },
} satisfies Meta<typeof WireframeArrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Directions: Story = {
  render: (args) => (
    <Row>
      {DIRECTIONS.map((direction) => (
        <div key={direction} className="flex flex-col items-center gap-1">
          <WireframeArrow {...args} direction={direction} width="7rem" height="4rem" />
          <span className="text-xs text-ink-muted">{direction}</span>
        </div>
      ))}
    </Row>
  ),
};

export const HeadsAndBends: Story = {
  render: (args) => (
    <Row>
      <WireframeArrow {...args} heads="Both" />
      <WireframeArrow {...args} heads="None" />
      <WireframeArrow {...args} bend="Left" />
      <WireframeArrow {...args} bend="Right" color="Sky" />
    </Row>
  ),
};

export const Dashed: Story = {
  render: (args) => (
    <Row>
      <WireframeArrow {...args} dashed />
      <WireframeArrow {...args} dashed bend="Right" heads="Both" color="Red" />
    </Row>
  ),
};
