import type { Meta, StoryObj } from "@storybook/react-vite";
import { Detail, Details } from "@/widgets/Lists";

const meta = {
  title: "Widgets/Details",
  component: Details,
  subcomponents: { Detail },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Details`, holding `Detail` rows (`Ivy.Detail`) — a label-and-value list for a record's properties.",
      },
    },
  },
  args: { width: "18rem" },
} satisfies Meta<typeof Details>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Details {...args}>
      <Detail label="Status">Active</Detail>
      <Detail label="Owner">Ada Lovelace</Detail>
      <Detail label="Created">2026-01-04</Detail>
      <Detail label="Tags">design, wireframe</Detail>
    </Details>
  ),
};
