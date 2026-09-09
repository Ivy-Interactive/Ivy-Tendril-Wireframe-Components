import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loading } from "@/widgets/primitives/Feedback";
import { Row } from "../shared";

const meta = {
  title: "Primitives/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Loading`. The waiting state, drawn rather than spun.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { label: "Thinking" },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Densities: Story = {
  render: (args) => (
    <Row>
      <Loading {...args} density="Small" label="Small" />
      <Loading {...args} density="Medium" label="Medium" />
      <Loading {...args} density="Large" label="Large" />
    </Row>
  ),
};
