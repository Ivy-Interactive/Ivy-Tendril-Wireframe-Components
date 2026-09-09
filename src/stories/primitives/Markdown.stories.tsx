import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "@/widgets/primitives/Code";

const meta = {
  title: "Primitives/Markdown",
  component: Markdown,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Markdown`. Headings, emphasis, code, links, lists and quotes, all rendered in the sketch hand.",
      },
    },
  },
  args: {
    width: "26rem",
    content:
      "## Heading\n\nSupports **bold**, *italic*, `code` and [links](#).\n\n- one\n- two\n\n> A quotation.",
  },
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
