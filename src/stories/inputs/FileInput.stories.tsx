import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileInput } from "@/widgets/inputs/SpecialInputs";
import { Row } from "../shared";

const meta = {
  title: "Inputs/FileInput",
  component: FileInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.FileInput`. The `Drop` variant draws a dashed target for dragging files onto.",
      },
    },
  },
  argTypes: { variant: { control: "inline-radio", options: ["Default", "Drop"] } },
  args: { placeholder: "Choose a document" },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DropZone: Story = {
  render: (args) => (
    <Row>
      <FileInput {...args} variant="Drop" accept=".png,.jpg" maxFileSize={5_000_000} width="18rem" />
    </Row>
  ),
};
