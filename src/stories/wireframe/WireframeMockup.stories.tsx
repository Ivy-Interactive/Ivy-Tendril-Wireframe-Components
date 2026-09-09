import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeMockup, WireframePlaceholder } from "@/widgets/wireframe";
import { Badge } from "@/widgets/Badge";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeMockup",
  component: WireframeMockup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeMockup`. A hand-drawn device or browser frame wrapped around real content — children are laid out in the screen area, so a mockup can hold any widget tree. `title` is the Desktop window title; `url` is the Website address bar.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["Mobile", "Tablet", "Desktop", "Website"] },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { variant: "Mobile" },
} satisfies Meta<typeof WireframeMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <WireframeMockup {...args}>
      <div className="flex flex-col gap-2 p-3">
        <TextBlock variant="H4">Inbox</TextBlock>
        <WireframePlaceholder text="Message" width="100%" height="3rem" />
        <WireframePlaceholder text="Message" width="100%" height="3rem" />
      </div>
    </WireframeMockup>
  ),
};

export const Devices: Story = {
  render: (args) => (
    <Row>
      <WireframeMockup {...args} variant="Mobile">
        <div className="h-full p-3">
          <WireframePlaceholder text="App" width="100%" height="100%" />
        </div>
      </WireframeMockup>
      <WireframeMockup {...args} variant="Tablet">
        <div className="h-full p-4">
          <WireframePlaceholder text="Board" width="100%" height="100%" />
        </div>
      </WireframeMockup>
    </Row>
  ),
};

export const WindowChrome: Story = {
  render: (args) => (
    <Row>
      <WireframeMockup {...args} variant="Desktop" title="Reports — Ivy">
        <div className="flex flex-col gap-2 p-4">
          <Badge title="Draft" variant="Warning" density="Small" />
          <WireframePlaceholder text="Report body" width="100%" height="6rem" />
        </div>
      </WireframeMockup>
      <WireframeMockup {...args} variant="Website" url="app.example.com/reports">
        <div className="h-full p-4">
          <WireframePlaceholder text="Landing hero" width="100%" height="100%" color="Sky" />
        </div>
      </WireframeMockup>
    </Row>
  ),
};
