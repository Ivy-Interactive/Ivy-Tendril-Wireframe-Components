import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@/widgets/Badge";
import { Button } from "@/widgets/Button";
import { Card } from "@/widgets/Card";
import { Progress, StackedProgress } from "@/widgets/Progress";
import { Breadcrumbs, Expandable, Pagination } from "@/widgets/Navigation";
import { DropDownMenu, Toolbar, Tooltip, Tree } from "@/widgets/Menus";
import { Detail, Details, List, ListItem } from "@/widgets/Lists";
import { Table, TableCell, TableRow } from "@/widgets/Table";
import { DataTable } from "@/widgets/DataTable";
import { Blade, BladeContainer, Dialog, DialogBody, DialogFooter, DialogHeader, Sheet } from "@/widgets/Overlays";
import { Chat, ChatLoading, ChatMessage, ChatStatus } from "@/widgets/Chat";
import { Kanban } from "@/widgets/Kanban";
import { Calendar } from "@/widgets/Calendar";
import { Animation, Confetti, WireframeCallout, WireframeNote } from "@/widgets/Wireframe";
import { Separator } from "@/widgets/primitives/Separator";
import { menuItems, people, treeItems } from "./data";

const meta: Meta = {
  title: "Widgets/Overview",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const Row = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <Separator text={title} />
    <div className="mt-3 flex flex-wrap items-start gap-4">{children}</div>
  </div>
);

export const Badges: Story = {
  render: () => (
    <Row title="Badge">
      {(["Primary", "Secondary", "Destructive", "Outline", "Success", "Warning", "Info"] as const).map(
        (variant) => (
          <Badge key={variant} variant={variant} title={variant} icon="Star" />
        ),
      )}
      <Badge title="Custom colour" color="Violet" />
      <Badge title="Small" density="Small" />
      <Badge title="Large" density="Large" />
    </Row>
  ),
};

export const Cards: Story = {
  render: () => (
    <Row title="Card">
      <Card title="Plain card" description="With a description" width="18rem">
        Cards hold whatever you put in them.
      </Card>
      <Card
        title="With a footer"
        width="18rem"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="Ghost" title="Cancel" density="Small" />
            <Button title="Confirm" density="Small" />
          </div>
        }
      >
        A footer sits below a dashed rule.
      </Card>
      <Card
        header={<Badge title="New" variant="Success" density="Small" />}
        title="With a header slot"
        width="18rem"
        hoverVariant="PointerAndTranslate"
        onClick={() => {}}
      >
        Hover to lift.
      </Card>
    </Row>
  ),
};

export const ProgressBars: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Progress value={62} goal="Uploading assets" />
      <Progress value={100} goal="Complete" color="Success" />
      <Progress indeterminate goal="Working…" />
      <StackedProgress
        segments={[
          { value: 40, label: "Done", color: "Green" },
          { value: 30, label: "In progress", color: "Amber" },
          { value: 30, label: "Not started", color: "Slate" },
        ]}
        selected={0}
      />
    </div>
  ),
};

export const Navigation: Story = {
  render: () => {
    const [page, setPage] = React.useState(4);
    return (
      <>
        <Row title="Breadcrumbs">
          <Breadcrumbs
            items={[{ label: "Home", icon: "House" }, { label: "Projects" }, { label: "Tendril" }]}
          />
        </Row>
        <Row title="Pagination">
          <Pagination page={page} numPages={14} onChange={setPage} />
        </Row>
        <Row title="Expandable">
          <div className="w-96">
            <Expandable header="Advanced options" defaultOpen>
              Everything you rarely need, tucked away.
            </Expandable>
          </div>
        </Row>
      </>
    );
  },
};

export const Menus: Story = {
  render: () => (
    <Row title="Menus, toolbars, tooltips, trees">
      <DropDownMenu
        items={menuItems}
        trigger={<Button title="Actions" icon="ChevronDown" iconPosition="Right" variant="Outline" />}
      />
      <Toolbar
        items={[
          { label: "Bold", icon: "Bold", checked: true },
          { label: "Italic", icon: "Italic" },
          { label: "Underline", icon: "Underline" },
          { label: "sep", variant: "Separator" },
          { label: "More", icon: "Ellipsis", children: menuItems },
        ]}
      />
      <Tooltip content="Drawn on a sticky note" trigger={<Button title="Hover me" variant="Secondary" />} />
      <div className="w-56">
        <Tree items={treeItems} rowActions={menuItems} />
      </div>
    </Row>
  ),
};

export const ListsAndDetails: Story = {
  render: () => (
    <Row title="List & Details">
      <div className="w-64">
        <List>
          <ListItem title="Inbox" subtitle="12 unread" icon="Inbox" badge="12" onClick={() => {}} />
          <ListItem title="Drafts" subtitle="2 drafts" icon="FileText" onClick={() => {}} />
          <ListItem title="Archive" icon="Archive" disabled />
        </List>
      </div>
      <div className="w-64">
        <Details>
          <Detail label="Status">Active</Detail>
          <Detail label="Owner">Ada Lovelace</Detail>
          <Detail label="Created">2026-01-04</Detail>
          <Detail label="Tags">design, wireframe</Detail>
        </Details>
      </div>
    </Row>
  ),
};

export const Tables: Story = {
  render: () => (
    <>
      <Row title="Table">
        <Table width="26rem">
          <thead>
            <TableRow isHeader>
              <TableCell isHeader>Item</TableCell>
              <TableCell isHeader alignContent="Right">
                Qty
              </TableCell>
              <TableCell isHeader alignContent="Right">
                Price
              </TableCell>
            </TableRow>
          </thead>
          <tbody>
            <TableRow>
              <TableCell>Pencils</TableCell>
              <TableCell alignContent="Right">12</TableCell>
              <TableCell alignContent="Right">£4.20</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Erasers</TableCell>
              <TableCell alignContent="Right">4</TableCell>
              <TableCell alignContent="Right">£1.80</TableCell>
            </TableRow>
          </tbody>
          <tfoot>
            <TableRow isFooter>
              <TableCell isFooter>Total</TableCell>
              <TableCell isFooter alignContent="Right">
                16
              </TableCell>
              <TableCell isFooter alignContent="Right">
                £6.00
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
      </Row>
      <Row title="DataTable">
        <DataTable
          width="42rem"
          rowActions={menuItems}
          config={{ pageSize: 3, selectionMode: "Multiple" }}
          columns={[
            { name: "name", header: "Name", icon: "User" },
            {
              name: "role",
              header: "Role",
              colType: "Badge",
              badgeColorMapping: { Admin: "Destructive", Editor: "Blue", Viewer: "Slate" },
            },
            { name: "score", header: "Score", colType: "Number", alignContent: "Right", footer: ["Σ 414"] },
            { name: "joined", header: "Joined", colType: "Date" },
            { name: "active", header: "Active", colType: "Boolean", alignContent: "Center" },
          ]}
          rows={people}
        />
      </Row>
    </>
  ),
};

export const Overlays: Story = {
  render: () => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);
    return (
      <>
        <Row title="Dialog & Sheet">
          <Button title="Open dialog" onClick={() => setDialogOpen(true)} />
          <Button title="Open sheet" variant="Outline" onClick={() => setSheetOpen(true)} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogHeader title="Delete project" description="This cannot be undone." />
            <DialogBody>Everything inside the project will be removed permanently.</DialogBody>
            <DialogFooter>
              <Button variant="Ghost" title="Cancel" onClick={() => setDialogOpen(false)} />
              <Button variant="Destructive" title="Delete" icon="Trash2" onClick={() => setDialogOpen(false)} />
            </DialogFooter>
          </Dialog>
          <Sheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            title="Filters"
            description="Narrow the results"
            side="Right"
          >
            Put any controls in here.
          </Sheet>
        </Row>
        <Row title="Blades">
          <div style={{ height: 220, width: "100%" }}>
            <BladeContainer>
              <Blade title="Projects" index={0}>
                <List>
                  <ListItem title="Tendril" onClick={() => {}} />
                  <ListItem title="Ivy" onClick={() => {}} />
                </List>
              </Blade>
              <Blade title="Tendril" index={1} onClose={() => {}} onRefresh={() => {}}>
                <Details>
                  <Detail label="Owner">Ada</Detail>
                  <Detail label="Stage">Build</Detail>
                </Details>
              </Blade>
            </BladeContainer>
          </div>
        </Row>
      </>
    );
  },
};

export const Conversation: Story = {
  render: () => (
    <Row title="Chat">
      <Chat width="28rem" height="22rem">
        <ChatMessage sender="User">How do I make it look hand-drawn?</ChatMessage>
        <ChatMessage sender="Assistant">
          Every border is a rough.js path drawn over a measured box.
        </ChatMessage>
        <ChatStatus text="Searching the sketchbook…" />
        <ChatLoading />
      </Chat>
    </Row>
  ),
};

export const Board: Story = {
  render: () => {
    const [tasks, setTasks] = React.useState([
      { id: "1", columnId: "todo", title: "Sketch the flow", assignee: "NB", priority: 2 },
      { id: "2", columnId: "todo", title: "Pick a typeface", priority: 1 },
      { id: "3", columnId: "doing", title: "Draw the components", assignee: "AB", priority: 3 },
      { id: "4", columnId: "done", title: "Set up the repo", priority: 0 },
    ]);
    return (
      <Kanban
        width="100%"
        height="22rem"
        columns={[
          { id: "todo", title: "To do", color: "Sky", limit: 4 },
          { id: "doing", title: "Doing", color: "Amber" },
          { id: "done", title: "Done", color: "Green" },
        ]}
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

export const Schedule: Story = {
  render: () => (
    <Calendar
      width="100%"
      height="26rem"
      defaultDate="2026-04-15"
      enableDragDrop
      events={[
        { eventId: "1", title: "Design review", start: "2026-04-15T10:00", color: "Blue" },
        { eventId: "2", title: "Retro", start: "2026-04-17T15:00", color: "Amber" },
        { eventId: "3", title: "Ship it", start: "2026-04-22T14:00", color: "Green" },
      ]}
    />
  ),
};

export const Annotation: Story = {
  render: () => (
    <>
      <Row title="Wireframe annotations">
        <WireframeNote text="Remember: this whole screen is a sketch, not a spec." />
        <WireframeNote text="Blue notes for open questions." color="Sky" />
        <div className="flex flex-col gap-2">
          <WireframeCallout label="1" leader={70}>
            Primary action
          </WireframeCallout>
          <WireframeCallout label="2" color="Blue" leader={70}>
            Secondary path
          </WireframeCallout>
        </div>
      </Row>
      <Row title="Effects">
        <Confetti trigger="Click">
          <Button title="Click for confetti" icon="PartyPopper" />
        </Confetti>
        <Animation type="Shake" trigger="Hover">
          <Button title="Hover to shake" variant="Outline" />
        </Animation>
        <Animation type="Bounce" repeat={null} duration={1.4}>
          <Badge title="Always bouncing" variant="Info" />
        </Animation>
      </Row>
    </>
  ),
};
