import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "@/widgets/Card";
import { Badge } from "@/widgets/Badge";
import { Button } from "@/widgets/Button";
import { Row } from "../shared";

const meta = {
  title: "Widgets/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Card`. A titled panel with an optional description, header slot and footer, sitting on drawn paper.",
      },
    },
  },
  argTypes: {
    hoverVariant: {
      control: "inline-radio",
      options: ["None", "Pointer", "PointerAndTranslate", "Shadow"],
    },
  },
  args: { title: "Plain card", description: "With a description", width: "18rem" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Card {...args}>Cards hold whatever you put in them.</Card>,
};

export const WithFooter: Story = {
  render: (args) => (
    <Card
      {...args}
      title="With a footer"
      description={undefined}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="Ghost" title="Cancel" density="Small" />
          <Button title="Confirm" density="Small" />
        </div>
      }
    >
      A footer sits below a dashed rule.
    </Card>
  ),
};

export const WithHeaderSlot: Story = {
  render: (args) => (
    <Card
      {...args}
      header={<Badge title="New" variant="Success" density="Small" />}
      title="With a header slot"
      description={undefined}
      hoverVariant="PointerAndTranslate"
      onClick={() => {}}
    >
      Hover to lift.
    </Card>
  ),
};

export const Gallery: Story = {
  render: (args) => (
    <Row>
      <Card {...args} title="One">
        First
      </Card>
      <Card {...args} title="Two">
        Second
      </Card>
      <Card {...args} title="Three">
        Third
      </Card>
    </Row>
  ),
};
