import type { Meta, StoryObj } from "@storybook/react-vite";
import { SketchFrame } from "@/sketch/SketchFrame";
import { SketchProvider } from "@/sketch/SketchProvider";
import { RoughShape } from "@/sketch/RoughShape";
import { Icon } from "@/sketch/Icon";
import { CHART_DEFAULT, CHART_RAINBOW, INK, INK_FAINT, INK_MUTED, PAPER, PAPER_RAISED, PAPER_SUNKEN, HIGHLIGHT, resolveColor } from "@/sketch/colors";
import { Button } from "@/widgets/Button";
import { Card } from "@/widgets/Card";
import { TextInput } from "@/widgets/inputs/TextInput";
import { Separator } from "@/widgets/primitives/Separator";

const meta: Meta = {
  title: "Foundations/Sketch layer",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`SketchFrame` is the primitive every widget sits on: it measures its own box and draws the border (and optional fill) as rough.js paths behind the content. `SketchProvider` sets the pencil for a whole subtree.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Frames: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["sharp", "rounded", "pill", "ellipse"] as const).map((corner) => (
        <SketchFrame
          key={corner}
          corner={corner}
          seed={corner}
          className="h-20 w-32"
          contentClassName="flex h-full w-full items-center justify-center text-sm"
        >
          {corner}
        </SketchFrame>
      ))}
    </div>
  ),
};

export const Fills: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["solid", "hachure", "cross-hatch", "zigzag", "dots", "dashed"] as const).map((fillStyle) => (
        <SketchFrame
          key={fillStyle}
          seed={fillStyle}
          fill={resolveColor("Sky")}
          fillStyle={fillStyle}
          fillWeight={0.8}
          className="h-20 w-32"
          contentClassName="flex h-full w-full items-center justify-center text-xs font-bold"
        >
          {fillStyle}
        </SketchFrame>
      ))}
    </div>
  ),
};

export const Outlines: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["solid", "dashed", "dotted"] as const).map((outline) => (
        <SketchFrame
          key={outline}
          outline={outline}
          seed={outline}
          className="h-20 w-32"
          contentClassName="flex h-full w-full items-center justify-center text-sm"
        >
          {outline}
        </SketchFrame>
      ))}
      <SketchFrame
        doubleStroke
        seed="double"
        className="h-20 w-32"
        contentClassName="flex h-full w-full items-center justify-center text-sm"
      >
        doubleStroke
      </SketchFrame>
      <SketchFrame
        sides={["bottom"]}
        seed="underline"
        className="h-20 w-32"
        contentClassName="flex h-full w-full items-center justify-center text-sm"
      >
        one side
      </SketchFrame>
    </div>
  ),
};

export const Roughness: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {[0, 1.2, 2.5].map((roughness) => (
        <SketchProvider key={roughness} roughness={roughness} bowing={roughness}>
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm text-ink-muted">roughness {roughness}</span>
            <Button title="Save" icon="Save" />
            <TextInput value="Sample" width="12rem" />
            <Card title="Card" width="10rem" />
          </div>
        </SketchProvider>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <svg width={520} height={140} className="overflow-visible">
      <RoughShape shape={{ kind: "rectangle", x: 8, y: 20, width: 80, height: 60 }} seed="s1" fill={resolveColor("Sky")} />
      <RoughShape shape={{ kind: "circle", cx: 140, cy: 50, diameter: 60 }} seed="s2" fill={resolveColor("Amber")} />
      <RoughShape shape={{ kind: "ellipse", cx: 230, cy: 50, width: 90, height: 55 }} seed="s3" fill={resolveColor("Rose")} />
      <RoughShape
        shape={{
          kind: "polygon",
          points: [
            [300, 80],
            [335, 18],
            [370, 80],
          ],
        }}
        seed="s4"
        fill={resolveColor("Green")}
      />
      <RoughShape
        shape={{
          kind: "curve",
          points: [
            [395, 75],
            [420, 25],
            [455, 78],
            [500, 30],
          ],
        }}
        seed="s5"
        stroke={INK}
        strokeWidth={2}
      />
    </svg>
  ),
};

const SWATCH = ({ name, value }: { name: string; value: string }) => (
  <div className="flex w-28 flex-col gap-1">
    <div
      className="h-12 w-full border border-ink-faint"
      style={{ background: value, borderRadius: "40% 60% 55% 45%" }}
    />
    <span className="text-[10px] text-ink-muted">{name}</span>
    <span className="font-sketch-mono text-[10px] text-ink-faint">{value}</span>
  </div>
);

export const Palette: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <Separator text="Surface" />
        <div className="mt-3 flex flex-wrap gap-3">
          <SWATCH name="ink" value={INK} />
          <SWATCH name="ink-muted" value={INK_MUTED} />
          <SWATCH name="ink-faint" value={INK_FAINT} />
          <SWATCH name="paper" value={PAPER} />
          <SWATCH name="paper-raised" value={PAPER_RAISED} />
          <SWATCH name="paper-sunken" value={PAPER_SUNKEN} />
          <SWATCH name="highlight" value={HIGHLIGHT} />
        </div>
      </div>
      <div>
        <Separator text="Semantic" />
        <div className="mt-3 flex flex-wrap gap-3">
          {["Primary", "Secondary", "Destructive", "Success", "Warning", "Info", "Muted"].map((name) => (
            <SWATCH key={name} name={name} value={resolveColor(name)} />
          ))}
        </div>
      </div>
      <div>
        <Separator text="Chart series" />
        <div className="mt-3 flex flex-wrap gap-3">
          {CHART_DEFAULT.map((value, index) => (
            <SWATCH key={value} name={`Default ${index}`} value={value} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {CHART_RAINBOW.map((value, index) => (
            <SWATCH key={value} name={`Rainbow ${index}`} value={value} />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {["Rocket", "Heart", "Star", "Folder", "Trash2", "Settings", "Search", "Bell", "User", "Cloud"].map(
        (name) => (
          <span key={name} className="flex w-20 flex-col items-center gap-1 text-[10px] text-ink-muted">
            <Icon name={name} size={26} />
            {name}
          </span>
        ),
      )}
      <SketchProvider wobbleGlyphs={false}>
        <span className="flex w-24 flex-col items-center gap-1 text-[10px] text-ink-muted">
          <Icon name="Rocket" size={26} />
          no wobble
        </span>
      </SketchProvider>
    </div>
  ),
};
