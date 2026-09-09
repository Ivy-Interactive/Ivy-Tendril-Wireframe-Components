import type { Meta, StoryObj } from "@storybook/react-vite";
import { Expandable } from "@/widgets/Navigation";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/Expandable",
  component: Expandable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Expandable`. A disclosure panel — leave `open` undefined to let it manage itself.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { header: "Advanced options", width: "24rem" },
} satisfies Meta<typeof Expandable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Expandable {...args}>Everything you rarely need, tucked away.</Expandable>,
};

export const OpenByDefault: Story = {
  render: (args) => (
    <Expandable {...args} defaultOpen>
      Opens with the page.
    </Expandable>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <Stack>
      <Expandable {...args} header="Framed" width="100%">
        The default, with a drawn border.
      </Expandable>
      <Expandable {...args} header="Ghost" ghost width="100%">
        No border, for a run of them down a page.
      </Expandable>
      <Expandable {...args} header="Disabled" disabled width="100%">
        Cannot be opened.
      </Expandable>
    </Stack>
  ),
};
