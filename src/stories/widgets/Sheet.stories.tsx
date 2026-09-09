import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheet, type SheetSide } from "@/widgets/Overlays";
import { Button } from "@/widgets/Button";
import { Row } from "../shared";

const SIDES: SheetSide[] = ["Left", "Right", "Top", "Bottom"];

const meta = {
  title: "Widgets/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Sheet`. A panel that slides in from an edge, for filters and side forms.",
      },
    },
  },
  argTypes: { side: { control: "inline-radio", options: SIDES } },
  args: { title: "Filters", description: "Narrow the results", side: "Right" },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button title="Open sheet" variant="Outline" onClick={() => setOpen(true)} />
        <Sheet {...args} open={open} onOpenChange={setOpen}>
          Put any controls in here.
        </Sheet>
      </>
    );
  },
};

export const Sides: Story = {
  render: (args) => (
    <Row>
      {SIDES.map((side) => (
        <Sheet
          key={side}
          {...args}
          side={side}
          title={side}
          trigger={<Button title={side} variant="Outline" />}
        >
          Slid in from the {side.toLowerCase()}.
        </Sheet>
      ))}
    </Row>
  ),
};
