import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flowchart } from "@/widgets/diagram/Flowchart";
import { RoughShape } from "@/sketch/RoughShape";
import { anchorOn, shapeOutline, type FlowShape } from "@/widgets/diagram/shapes";
import { INK, tint } from "@/sketch/colors";

const meta = {
  title: "Diagrams/Flowchart",
  component: Flowchart,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A flowchart that lays itself out. Give it `nodes` and `edges`, or write the " +
          "whole thing in `chart` using a subset of Mermaid's syntax.",
      },
    },
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["Down", "Up", "Right", "Left"] },
    edgeStyle: { control: "inline-radio", options: ["Elbow", "Curved", "Straight"] },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
} satisfies Meta<typeof Flowchart>;

export default meta;
type Story = StoryObj<typeof meta>;

const REVIEW = `
  Start([New request]) --> Triage[Triage]
  Triage --> Check{Complete?}
  Check -- yes --> Review[Peer review]
  Check -- no --> Ask[/Ask for detail/]
  Ask --> Triage
  Review --> Sign{Approved?}
  Sign -- yes --> Store[(Archive)]
  Sign -- no --> Rework[Rework]
  Rework --> Review
  Store --> Done([Done])
`;

export const Default: Story = {
  args: { id: "flow-default", chart: REVIEW },
};

/** The same chart written out as data. Both forms reach the same layout. */
export const FromData: Story = {
  args: {
    id: "flow-data",
    nodes: [
      { id: "start", label: "Start", shape: "Terminator" },
      { id: "check", label: "Valid?", shape: "Decision" },
      { id: "save", label: "Save record", icon: "Save" },
      { id: "done", label: "Done", shape: "Terminator" },
    ],
    edges: [
      { from: "start", to: "check" },
      { from: "check", to: "save", label: "yes" },
      { from: "check", to: "start", label: "no", dashed: true },
      { from: "save", to: "done" },
    ],
  },
};

/**
 * A retry loop is a cycle, and a cycle is what a naive ranking cannot do. The back edge is
 * reversed to rank the graph, then drawn pointing the way it was written.
 */
export const WithACycle: Story = {
  args: {
    id: "flow-cycle",
    chart: `
      Build[Build] --> Test{Tests pass?}
      Test -- no --> Fix[Fix]
      Fix --> Build
      Test -- yes --> Ship([Ship])
    `,
  },
};

export const Directions: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-10">
      {(["Down", "Right", "Up", "Left"] as const).map((direction) => (
        <div key={direction}>
          <p className="mb-2 font-mono text-[11px] text-neutral-500">{direction}</p>
          <Flowchart
            id={`flow-${direction}`}
            direction={direction}
            chart="A[Draft] --> B{Review} --> C([Publish])"
          />
        </div>
      ))}
    </div>
  ),
};

export const EdgeStyles: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-10">
      {(["Elbow", "Curved", "Straight"] as const).map((edgeStyle) => (
        <div key={edgeStyle}>
          <p className="mb-2 font-mono text-[11px] text-neutral-500">{edgeStyle}</p>
          <Flowchart
            id={`flow-${edgeStyle}`}
            edgeStyle={edgeStyle}
            chart={`
              Root[Root] --> A[Left branch]
              Root --> B[Right branch]
              A --> End([End])
              B --> End
            `}
          />
        </div>
      ))}
    </div>
  ),
};

/** Every shape the vocabulary carries, drawn straight from `shapeOutline`. */
export const Shapes: Story = {
  render: () => {
    const shapes: FlowShape[] = [
      "Process",
      "Decision",
      "Terminator",
      "InputOutput",
      "Preparation",
      "Manual",
      "Document",
      "Database",
      "Connector",
      "Note",
    ];

    return (
      <div className="grid grid-cols-5 gap-6">
        {shapes.map((shape) => {
          const rect = { x: 10, y: 10, width: 120, height: 62 };
          const outline = shapeOutline(shape, rect);
          return (
            <div key={shape}>
              <svg width={140} height={82} className="overflow-visible">
                <RoughShape
                  shape={{ kind: "polygon", points: outline }}
                  stroke={INK}
                  strokeWidth={1.3}
                  fill={tint(INK, 0.92)}
                  fillStyle="solid"
                  seed={`shape-${shape}`}
                />
                {/* The anchors an edge would use, so a bad outline is obvious. */}
                {[0, 0.25, 0.5, 0.75].map((t) => {
                  const angle = t * Math.PI * 2;
                  const cx = rect.x + rect.width / 2;
                  const cy = rect.y + rect.height / 2;
                  const far: [number, number] = [
                    cx + Math.cos(angle) * 400,
                    cy + Math.sin(angle) * 400,
                  ];
                  const hit = anchorOn(outline, [cx, cy], far);
                  return <circle key={t} cx={hit[0]} cy={hit[1]} r={2.4} fill="#b4443a" />;
                })}
              </svg>
              <p className="font-mono text-[10.5px] text-neutral-500">{shape}</p>
            </div>
          );
        })}
      </div>
    );
  },
};

/** A line it cannot read comes back as a problem with a line number, never a silent drop. */
export const ParseErrors: Story = {
  args: {
    id: "flow-errors",
    chart: `
      A[Good] --> B[Also good]
      !!! not a chart line
      B --> C[Still fine]
    `,
  },
};
