import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { Box } from "@/widgets/primitives/Box";
import { Callout } from "@/widgets/primitives/Callout";
import { Separator } from "@/widgets/primitives/Separator";
import { Empty, ErrorPanel, Loading, Skeleton, Spacer } from "@/widgets/primitives/Feedback";
import { Avatar, Icon, Kbd, Stepper } from "@/widgets/primitives/Misc";
import { AudioPlayer, Embed, Iframe, Image, Svg, VideoPlayer } from "@/widgets/primitives/Media";
import { CodeBlock, Html, Json, Markdown, Terminal, Xml } from "@/widgets/primitives/Code";

const meta: Meta = {
  title: "Primitives/Overview",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "The `Ivy` primitives, redrawn by hand. Each keeps its Ivy prop names.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <Separator text={title} />
    <div className="mt-3 flex flex-wrap items-start gap-4">{children}</div>
  </div>
);

export const TextBlocks: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["Display", "H1", "H2", "H3", "Lead", "P", "Blockquote", "Muted", "Danger", "Success", "Monospaced"] as const).map(
        (variant) => (
          <TextBlock key={variant} variant={variant} content={`${variant} — the quick brown fox`} />
        ),
      )}
      <TextBlock content="Struck through and bold" strikeThrough bold />
    </div>
  ),
};

export const Boxes: Story = {
  render: () => (
    <Row title="Box">
      <Box width="10rem" height="6rem">
        Rounded
      </Box>
      <Box width="10rem" height="6rem" borderRadius="None" borderStyle="Dashed">
        Dashed
      </Box>
      <Box width="10rem" height="6rem" background="White" hoverVariant="Shadow">
        Hover me
      </Box>
      <Box width="6rem" height="6rem" borderRadius="Full" background="Amber">
        Full
      </Box>
    </Row>
  ),
};

export const Callouts: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["Info", "Success", "Warning", "Error"] as const).map((variant) => (
        <Callout key={variant} variant={variant} title={variant} width="24rem">
          A short explanation of what just happened.
        </Callout>
      ))}
    </div>
  ),
};

export const Feedback: Story = {
  render: () => (
    <>
      <Row title="Loading & placeholders">
        <Loading label="Thinking" />
        <div style={{ width: 220 }}>
          <Skeleton lines={3} />
        </div>
      </Row>
      <Row title="Empty & error">
        <Empty title="No results" description="Try a different filter" />
        <ErrorPanel title="Request failed" message="The server did not respond in time." />
      </Row>
    </>
  ),
};

export const Separators: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Separator />
      <Separator text="Centred" />
      <Separator text="Left" textAlign="Left" />
      <Separator text="Right" textAlign="Right" />
      <div className="flex h-12 items-center gap-4">
        <span>Before</span>
        <Separator orientation="Vertical" />
        <span>After</span>
      </div>
    </div>
  ),
};

export const Assorted: Story = {
  render: () => (
    <>
      <Row title="Avatars, icons, keys">
        <Avatar fallback="NB" />
        <Avatar fallback="AB" color="Blue" density="Large" />
        <Avatar fallback="XY" density="Small" />
        <Icon name="Rocket" />
        <Icon name="Heart" color="Rose" density="Large" />
        <span className="flex items-center gap-1">
          <Kbd content="⌘" />
          <Kbd content="K" />
        </span>
      </Row>
      <Row title="Stepper">
        <div style={{ width: 420 }}>
          <Stepper
            items={[{ label: "Pick" }, { label: "Configure" }, { label: "Deploy" }]}
            selectedIndex={1}
          />
        </div>
      </Row>
      <Row title="Spacer">
        <div className="flex w-80 items-center border border-dashed border-ink-faint p-2">
          <span>Left</span>
          <Spacer />
          <span>Right</span>
        </div>
      </Row>
    </>
  ),
};

export const Media: Story = {
  render: () => (
    <>
      <Row title="Image placeholders">
        <Image alt="Hero image" />
        <Image alt="Square" width="8rem" height="8rem" borderRadius="None" />
        <Image alt="Avatar" width="6rem" height="6rem" borderRadius="Full" />
      </Row>
      <Row title="Players & embeds">
        <AudioPlayer src="" />
        <VideoPlayer source={null} width="18rem" height="10rem" />
        <Embed url="https://youtube.com/watch?v=dQw4w9WgXcQ" />
        <Iframe src="about:blank" width="16rem" height="8rem" />
        <Svg
          content='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="#2f2f2f"/></svg>'
          width="3rem"
          height="3rem"
        />
      </Row>
    </>
  ),
};

export const CodeAndText: Story = {
  render: () => (
    <>
      <Row title="Code">
        <CodeBlock
          language="tsx"
          showLineNumbers
          width="26rem"
          content={'const button = <Button title="Save" icon="Save" />;\nrender(button);'}
        />
        <Json content='{"name":"tendril","version":"0.1.0","tags":["sketch","wireframe"]}' width="20rem" />
      </Row>
      <Row title="Markup">
        <Xml content="<project><name>Tendril</name><type>library</type></project>" width="20rem" />
        <Html content="<p>Raw <strong>HTML</strong> renders inline.</p>" />
        <Terminal
          width="22rem"
          lines={[
            { content: "npm install @ivy/tendril", isCommand: true },
            { content: "added 12 packages in 3s" },
          ]}
        />
      </Row>
      <Row title="Markdown">
        <Markdown
          width="26rem"
          content={
            "## Heading\n\nSupports **bold**, *italic*, `code` and [links](#).\n\n- one\n- two\n\n> A quotation."
          }
        />
      </Row>
    </>
  ),
};
