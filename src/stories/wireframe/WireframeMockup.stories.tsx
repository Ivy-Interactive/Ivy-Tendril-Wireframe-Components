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
    variant: { control: "inline-radio", options: ["Mobile", "Tablet", "Website", "OSX", "Windows"] },
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
      <WireframeMockup {...args} variant="OSX" title="Reports — Ivy">
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

const INVOICES = [
  "Invoice 1043", "Invoice 1044", "Invoice 1045", "Invoice 1046", "Invoice 1047",
  "Invoice 1048", "Invoice 1049", "Invoice 1050",
];

/**
 * The frame grows to fit its children. This list is far taller than a phone's default size
 * and the mockup gets taller with it, where before it was cut off at the bottom of a
 * notional screen with nothing to show that anything was missing.
 */
export const GrowsToFitContent: Story = {
  render: () => (
    <WireframeMockup id="mock-grow" variant="Mobile">
      <div className="flex flex-col gap-2 p-3">
        {/* Deliberately more than a phone's default height holds, so the growth is the
            thing on show. */}
        {Array.from({ length: 22 }, (_, i) => (
          <Badge key={i} title={`Invoice ${1043 + i}`} variant="Secondary" />
        ))}
      </div>
    </WireframeMockup>
  ),
};

/**
 * With an explicit `height` the frame cannot grow, so the content is clipped — and the clip
 * is drawn. The torn edge and the fade say "there is more"; set a height only when the
 * frame's size is itself the point.
 */
export const ClippedHeightIsVisible: Story = {
  render: () => (
    <Row>
      <WireframeMockup id="mock-clip" variant="Mobile" height={62}>
        <div className="flex flex-col gap-2 p-3">
          {INVOICES.map((label) => (
            <Badge key={label} title={label} variant="Secondary" />
          ))}
        </div>
      </WireframeMockup>
      <WireframeMockup id="mock-clip-web" variant="Website" url="app.example.com" height={70}>
        <div className="flex flex-col gap-2 p-3">
          <TextBlock variant="H3">Pricing</TextBlock>
          {INVOICES.map((label) => (
            <Badge key={label} title={label} variant="Secondary" />
          ))}
        </div>
      </WireframeMockup>
    </Row>
  ),
};

/**
 * All five frames. `OSX` and `Windows` were one `Desktop` variant that always drew macOS
 * traffic lights — actively misleading on a wireframe of a Windows app, since the platform
 * is the first thing a reviewer reads off a window sketch.
 */
export const EveryVariant: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <WireframeMockup variant="Mobile" id="v-mobile" />
      <WireframeMockup variant="Tablet" id="v-tablet" />
      <WireframeMockup variant="Website" id="v-web" url="app.example.com" icon="Globe" />
      <WireframeMockup variant="OSX" id="v-osx" title="Preview" />
      <WireframeMockup variant="Windows" id="v-win" title="Convertly" icon="Repeat" />
    </div>
  ),
};

/**
 * A full Windows application window: app icon and title on the left, caption buttons on the
 * right, a real menu bar, and a status bar along the foot.
 */
export const WindowsApplication: Story = {
  render: () => (
    <WireframeMockup
      id="win-app"
      variant="Windows"
      title="Convertly — Batch Converter"
      icon="Repeat"
      menu={["File", "Edit", "View", "Convert", "Help"]}
      footer="Ready · 12 files queued"
      width="46rem"
    >
      <div className="flex gap-3 p-3">
        <WireframePlaceholder text="Queue" width="14rem" height="11rem" />
        <WireframePlaceholder text="Preview" width="100%" height="11rem" color="Sky" />
      </div>
    </WireframeMockup>
  ),
};

/** The same chrome props on macOS: centred title, traffic lights, toolbar and status bar. */
export const MacApplication: Story = {
  render: () => (
    <WireframeMockup
      id="osx-app"
      variant="OSX"
      title="Convertly"
      menu={["Import", "Export", "Share"]}
      footer="3 items · 48 MB"
      width="40rem"
    >
      <div className="p-3">
        <WireframePlaceholder text="Library" width="100%" height="10rem" />
      </div>
    </WireframeMockup>
  ),
};

/** A phone with an app bar and a tab bar, drawn as chrome rather than laid out by hand. */
export const MobileWithBars: Story = {
  render: () => (
    <WireframeMockup
      id="mob-bars"
      variant="Mobile"
      menu={["Inbox"]}
      footer={
        <div className="flex w-full justify-around">
          <span>Home</span>
          <span>Search</span>
          <span>You</span>
        </div>
      }
    >
      <div className="flex flex-col gap-2 p-2">
        <Badge title="Unread 3" variant="Info" />
        <Badge title="Invoice 1043" variant="Secondary" />
        <Badge title="Invoice 1044" variant="Secondary" />
      </div>
    </WireframeMockup>
  ),
};
