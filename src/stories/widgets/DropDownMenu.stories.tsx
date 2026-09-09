import type { Meta, StoryObj } from "@storybook/react-vite";
import { DropDownMenu } from "@/widgets/Menus";
import { Button } from "@/widgets/Button";
import { menuItems } from "../data";
import { Row } from "../shared";

const meta = {
  title: "Widgets/DropDownMenu",
  component: DropDownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.DropDownMenu`. Takes the same `MenuItem[]` as `Toolbar` and `Tree`, including separators, checkboxes, radios and nested groups.",
      },
    },
  },
  argTypes: {
    align: { control: "inline-radio", options: ["Start", "Center", "End"] },
    side: { control: "inline-radio", options: ["Top", "Right", "Bottom", "Left"] },
  },
  args: { items: menuItems },
} satisfies Meta<typeof DropDownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropDownMenu
      {...args}
      trigger={<Button title="Actions" icon="ChevronDown" iconPosition="Right" variant="Outline" />}
    />
  ),
};

export const WithHeader: Story = {
  render: (args) => (
    <DropDownMenu
      {...args}
      header={<div className="px-2.5 py-1.5 text-xs text-ink-muted">Signed in as Ada</div>}
      trigger={<Button title="Account" icon="User" variant="Secondary" />}
    />
  ),
};

export const ChecksAndRadios: Story = {
  render: (args) => (
    <Row>
      <DropDownMenu
        {...args}
        items={[
          {
            label: "View",
            variant: "Group",
            children: [
              { label: "Compact", variant: "Radio", checked: true },
              { label: "Comfortable", variant: "Radio" },
            ],
          },
          { label: "sep", variant: "Separator" },
          { label: "Show gridlines", variant: "Checkbox", checked: true },
          { label: "Show rulers", variant: "Checkbox" },
        ]}
        trigger={<Button title="View" icon="Eye" variant="Outline" />}
      />
    </Row>
  ),
};
