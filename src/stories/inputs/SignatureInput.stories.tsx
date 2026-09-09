import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignatureInput } from "@/widgets/inputs/SpecialInputs";

const meta = {
  title: "Inputs/SignatureInput",
  component: SignatureInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.SignatureInput`. A ruled pad to sign on, with a clear button.",
      },
    },
  },
} satisfies Meta<typeof SignatureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
