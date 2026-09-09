import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@/widgets/Navigation";
import { Stack } from "../shared";

const meta = {
  title: "Widgets/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Pagination`. `siblings` and `boundaries` decide how many pages stay visible either side of the current one and at each end.",
      },
    },
  },
  argTypes: { density: { control: "inline-radio", options: ["Small", "Medium", "Large"] } },
  args: { page: 4, numPages: 14 },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(args.page ?? 1);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
};

export const Windows: Story = {
  render: (args) => (
    <Stack width="34rem">
      <Pagination {...args} siblings={0} boundaries={1} />
      <Pagination {...args} siblings={2} boundaries={1} />
      <Pagination {...args} siblings={1} boundaries={2} />
    </Stack>
  ),
};

export const Short: Story = {
  args: { numPages: 3, page: 2 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
