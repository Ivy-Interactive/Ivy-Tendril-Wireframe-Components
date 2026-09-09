import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tab, TabsLayout } from "@/widgets/layouts";
import { List, ListItem } from "@/widgets/Lists";
import { TextBlock } from "@/widgets/primitives/TextBlock";
import { WireframePlaceholder } from "@/widgets/wireframe";
import { Frame } from "../shared";

const meta = {
  title: "Layouts/TabsLayout",
  component: TabsLayout,
  subcomponents: { Tab },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.TabsLayout`, holding `Tab` children (`Ivy.Tab`). `Content` is the quiet variant — a wavy underline under the live tab; `Tabs` draws boxed, browser-style tabs sitting on the panel.",
      },
    },
  },
  argTypes: { variant: { control: "inline-radio", options: ["Content", "Tabs"] } },
  args: { height: "14rem" },
} satisfies Meta<typeof TabsLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [index, setIndex] = React.useState(0);
    return (
      <Frame>
        <TabsLayout {...args} selectedIndex={index} onSelect={setIndex}>
          <Tab title="Overview" icon="House">
            <TextBlock>The quiet variant: a wavy underline marks the live tab.</TextBlock>
          </Tab>
          <Tab title="Activity" icon="Activity" badge="3">
            <List>
              <ListItem title="Deployed to staging" />
              <ListItem title="Review requested" />
            </List>
          </Tab>
          <Tab title="Settings" icon="Settings">
            <WireframePlaceholder text="Settings form" width="100%" height="6rem" />
          </Tab>
        </TabsLayout>
      </Frame>
    );
  },
};

export const Boxed: Story = {
  render: (args) => (
    <Frame>
      <TabsLayout {...args} variant="Tabs">
        <Tab title="index.tsx" icon="FileCode">
          <TextBlock>Boxed tabs overlap the panel's top edge, so they sit on it.</TextBlock>
        </Tab>
        <Tab title="README.md" icon="FileText">
          <TextBlock>The active tab keeps the paper it shares with the panel.</TextBlock>
        </Tab>
      </TabsLayout>
    </Frame>
  ),
};

export const Editable: Story = {
  render: (args) => (
    <Frame>
      <TabsLayout
        {...args}
        variant="Tabs"
        addButtonText="New"
        onClose={() => {}}
        onRefresh={() => {}}
        onReorder={() => {}}
        onAddButtonClick={() => {}}
      >
        <Tab title="index.tsx" icon="FileCode">
          <TextBlock>Drag a tab to reorder it.</TextBlock>
        </Tab>
        <Tab title="README.md" icon="FileText">
          <TextBlock>Each tab closes, and the live one refreshes.</TextBlock>
        </Tab>
        <Tab title="schema.sql" icon="Database">
          <TextBlock>The add button trails the strip.</TextBlock>
        </Tab>
      </TabsLayout>
    </Frame>
  ),
};
