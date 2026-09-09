import type { Meta, StoryObj } from "@storybook/react-vite";
import { Xml } from "@/widgets/primitives/Code";

const meta = {
  title: "Primitives/Xml",
  component: Xml,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Mirrors `Ivy.Xml`. Pretty-prints an XML string." } },
  },
  args: {
    content: "<project><name>Tendril</name><type>library</type></project>",
    width: "20rem",
  },
} satisfies Meta<typeof Xml>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
