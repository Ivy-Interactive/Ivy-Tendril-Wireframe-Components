import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kanban } from "@/widgets/Kanban";

const COLUMNS = [
  { id: "todo", title: "To do", color: "Sky", limit: 4 },
  { id: "doing", title: "Doing", color: "Amber" },
  { id: "done", title: "Done", color: "Green" },
];

const TASKS = [
  { id: "1", columnId: "todo", title: "Sketch the flow", assignee: "NB", priority: 2 },
  { id: "2", columnId: "todo", title: "Pick a typeface", priority: 1 },
  { id: "3", columnId: "doing", title: "Draw the components", assignee: "AB", priority: 3 },
  { id: "4", columnId: "done", title: "Set up the repo", priority: 0 },
];

const meta = {
  title: "Widgets/Kanban",
  component: Kanban,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Mirrors `Ivy.Kanban`. Cards drag between columns; `limit` marks a column that is over its work-in-progress cap.",
      },
    },
  },
  args: { width: "100%", height: "22rem", columns: COLUMNS, tasks: TASKS },
} satisfies Meta<typeof Kanban>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [tasks, setTasks] = React.useState(TASKS);
    return (
      <Kanban
        {...args}
        tasks={tasks}
        onCardMove={(taskId, to) =>
          setTasks((current) =>
            current.map((task) => (task.id === taskId ? { ...task, columnId: to } : task)),
          )
        }
      />
    );
  },
};

export const Empty: Story = {
  args: { tasks: [] },
};
