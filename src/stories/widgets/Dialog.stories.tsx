import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "@/widgets/Overlays";
import { Button } from "@/widgets/Button";

const meta = {
  title: "Widgets/Dialog",
  component: Dialog,
  subcomponents: { DialogHeader, DialogBody, DialogFooter },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Dialog`, composed from `DialogHeader`, `DialogBody` and `DialogFooter`. The modal is drawn with a heavier, doubled stroke so it reads as sitting above the page.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button title="Open dialog" onClick={() => setOpen(true)} />
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <DialogHeader title="Delete project" description="This cannot be undone." />
          <DialogBody>Everything inside the project will be removed permanently.</DialogBody>
          <DialogFooter>
            <Button variant="Ghost" title="Cancel" onClick={() => setOpen(false)} />
            <Button
              variant="Destructive"
              title="Delete"
              icon="Trash2"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const WithTrigger: Story = {
  render: (args) => (
    <Dialog {...args} trigger={<Button title="Open from a trigger" variant="Outline" />}>
      <DialogHeader title="Rename" />
      <DialogBody>The trigger opens the dialog without any state of your own.</DialogBody>
    </Dialog>
  ),
};
