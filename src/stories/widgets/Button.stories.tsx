import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, type ButtonVariant } from "@/widgets/Button";

const VARIANTS: ButtonVariant[] = [
  "Primary",
  "Secondary",
  "Destructive",
  "Outline",
  "Ghost",
  "Link",
  "Inline",
  "Ai",
];

const meta = {
  title: "Widgets/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Button`. Ivy's `events` array is replaced by an `onClick` callback; every other prop keeps its Ivy name and value set.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
    iconPosition: { control: "inline-radio", options: ["Left", "Right"] },
    borderRadius: { control: "inline-radio", options: ["None", "Rounded", "Full"] },
  },
  args: { title: "Click me", variant: "Primary", density: "Medium" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant} title={variant} />
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} icon="Rocket" title="Launch" />
      <Button {...args} icon="ArrowRight" iconPosition="Right" title="Next" />
      <Button {...args} icon="Save" title="Save" shortcutKey="⌘S" />
      <Button {...args} icon="Bell" title="Alerts" badge="9" />
    </div>
  ),
};

export const Densities: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} density="Small" title="Small" />
      <Button {...args} density="Medium" title="Medium" />
      <Button {...args} density="Large" title="Large" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} title="Normal" />
      <Button {...args} title="Loading" loading />
      <Button {...args} title="Disabled" disabled />
      <Button {...args} title="Struck through" strikeThrough />
      <Button {...args} title="Pill" borderRadius="Full" />
      <Button {...args} title="Square" borderRadius="None" />
    </div>
  ),
};

export const AsLink: Story = {
  args: { title: "Open the docs", url: "https://example.com", target: "Blank", variant: "Link" },
};

/**
 * A button sizes to its label, whichever way the surrounding flex container runs. Dropped
 * into a `flex flex-col` it used to take the whole column width, which is occasionally
 * wanted but never by accident -- and the accident is invisible until someone looks at a
 * screenshot.
 *
 * Say it explicitly with `width="100%"` when a full-width button is the intent.
 */
export const InFlexContainers: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex w-96 flex-col gap-2 border border-dashed border-neutral-300 p-3">
        <Button {...args} title="Sized to its label" />
        <Button {...args} title="So is this" variant="Secondary" icon="Plus" />
      </div>

      <div className="flex w-96 flex-col gap-2 border border-dashed border-neutral-300 p-3">
        <Button {...args} title="Full width, on purpose" width="100%" />
      </div>
    </div>
  ),
};
