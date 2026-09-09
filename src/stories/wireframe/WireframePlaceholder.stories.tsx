import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframePlaceholder } from "@/widgets/wireframe";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframePlaceholder",
  component: WireframePlaceholder,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframePlaceholder`. The crossed box that stands in for content nobody has drawn yet. The label sits on a wash of the same colour, so the diagonals look like they pass behind the text rather than through it.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { text: "Hero image" },
} satisfies Meta<typeof WireframePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <Row>
      <WireframePlaceholder {...args} text="Chart goes here" color="Sky" width="16rem" height="8rem" />
      <WireframePlaceholder {...args} text={undefined} color="Gray" width="8rem" height="8rem" />
      <WireframePlaceholder {...args} text="Dense" density="Small" width="10rem" height="5rem" />
    </Row>
  ),
};

export const Unlabelled: Story = {
  args: { text: undefined },
};
