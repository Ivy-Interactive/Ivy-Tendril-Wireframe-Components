import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, type BadgeVariant } from "@/widgets/Badge";
import { Row } from "../shared";

const VARIANTS: BadgeVariant[] = [
  "Primary",
  "Secondary",
  "Destructive",
  "Outline",
  "Success",
  "Warning",
  "Info",
];

const meta = {
  title: "Widgets/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Mirrors `Ivy.Badge`. A small status marker, drawn as a pill in the sketch hand.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { title: "Badge", variant: "Primary" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Row>
      {VARIANTS.map((variant) => (
        <Badge key={variant} {...args} variant={variant} title={variant} icon="Star" />
      ))}
    </Row>
  ),
};

export const Densities: Story = {
  render: (args) => (
    <Row>
      <Badge {...args} density="Small" title="Small" />
      <Badge {...args} density="Medium" title="Medium" />
      <Badge {...args} density="Large" title="Large" />
    </Row>
  ),
};

export const CustomColour: Story = {
  render: (args) => (
    <Row>
      <Badge {...args} color="Violet" title="Violet" />
      <Badge {...args} color="Teal" title="Teal" />
      <Badge {...args} color="Rose" title="Rose" icon="Heart" />
    </Row>
  ),
};

/**
 * A badge is a pill and never fills its container, whichever way the surrounding flex
 * container runs. It used to: dropped into a `flex flex-col`, the default
 * `align-items: stretch` gave it the full column width with the label adrift at one end,
 * and the fix -- `items-start` on the parent -- was only ever found by looking at a
 * screenshot.
 *
 * The second row is the reason this is `width: fit-content` rather than
 * `align-self: start`. In a row the cross axis is vertical, so `align-self` would pull
 * every badge to the top of a row whose other content is taller.
 */
export const InFlexContainers: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex w-96 flex-col gap-2 border border-dashed border-neutral-300 p-3">
        <Badge {...args} title="In a column" variant="Secondary" />
        <Badge {...args} title="Still a pill" variant="Info" icon="Sparkles" />
      </div>

      <div className="flex w-96 items-center gap-2 border border-dashed border-neutral-300 p-3">
        <Badge {...args} title="In a row" variant="Success" />
        <span className="text-2xl leading-loose">Taller neighbour</span>
      </div>

      <div className="flex w-96 flex-col gap-2 border border-dashed border-neutral-300 p-3">
        <Badge {...args} title="Full width, on purpose" variant="Warning" width="100%" />
      </div>
    </div>
  ),
};
