import type { Meta, StoryObj } from "@storybook/react-vite";
import { WireframeCurlyBrace } from "@/widgets/wireframe";
import { List, ListItem } from "@/widgets/Lists";
import { Row } from "../shared";

const meta = {
  title: "Wireframe/WireframeCurlyBrace",
  component: WireframeCurlyBrace,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.WireframeCurlyBrace`. `variant` names the direction of the centre nub, not of the span: a `Horizontal` brace is the familiar `{`, spanning downwards with the nub pointing left.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["Horizontal", "Vertical"] },
    density: { control: "inline-radio", options: ["Small", "Medium", "Large"] },
  },
  args: { variant: "Horizontal", height: "9rem" },
} satisfies Meta<typeof WireframeCurlyBrace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GatheringAList: Story = {
  render: (args) => (
    <Row>
      <div className="flex items-center gap-3">
        <WireframeCurlyBrace {...args} />
        <List width="12rem">
          <ListItem title="Search" />
          <ListItem title="Filters" />
          <ListItem title="Saved views" />
        </List>
      </div>
    </Row>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <Row>
      <div className="flex flex-col items-center gap-2">
        <WireframeCurlyBrace {...args} variant="Vertical" width="14rem" height={undefined} />
        <span className="text-sm text-ink-muted">One toolbar, three groups</span>
      </div>
    </Row>
  ),
};
