import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "@/widgets/Progress";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Progress`. The bar is a drawn box with a hatched fill, so a part-finished job looks part-finished.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { value: 62, goal: "Uploading assets", width: "24rem" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: (args) => (
    <Stack>
      <Progress {...args} value={0} goal="Not started" />
      <Progress {...args} value={62} goal="Uploading assets" />
      <Progress {...args} value={100} goal="Complete" color="Success" />
      <Progress {...args} indeterminate goal="Working…" />
    </Stack>
  ),
};

export const Colours: Story = {
  render: (args) => (
    <Stack>
      <Progress {...args} value={45} color="Info" goal="Info" />
      <Progress {...args} value={70} color="Warning" goal="Warning" />
      <Progress {...args} value={30} color="Destructive" goal="Destructive" />
    </Stack>
  ),
};
