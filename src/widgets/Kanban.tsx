import * as React from "react";
import { byDensity, cn, densityText, sizeStyle, widgetStyle } from "@/lib/utils";
import type { Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { Avatar } from "./primitives/Misc";
import { Badge } from "./Badge";

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  /** Refuses drops once this many cards are in the column. */
  limit?: number;
}

export interface KanbanTask {
  id: string;
  columnId: string;
  title?: string;
  description?: string;
  assignee?: string;
  priority?: number;
  order?: number;
}

export interface KanbanCardProps extends WidgetBaseProps {
  cardId?: string;
  /** The column this card belongs to. `status` is Ivy's older alias. */
  column?: string;
  columnName?: string;
  status?: string;
  title?: string;
  description?: string;
  assignee?: string;
  priority?: number;
  children?: React.ReactNode;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const PRIORITY_LABEL = ["None", "Low", "Medium", "High", "Urgent"];
const PRIORITY_COLOR = ["Muted", "Sky", "Amber", "Orange", "Destructive"];

/** One card on the board. Mirrors `Ivy.KanbanCard`. */
export const KanbanCard = ({
  id,
  title,
  description,
  assignee,
  priority,
  width,
  height,
  aspectRatio,
  visible,
  density = "Medium",
  children,
  className,
  style,
  draggable,
  onDragStart,
  onClick,
}: KanbanCardProps) => (
  <div draggable={draggable} onDragStart={onDragStart} className={cn(draggable && "cursor-grab active:cursor-grabbing")}>
    <SketchFrame
      id={id}
      seed={id ?? title ?? "kanban-card"}
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      onClick={onClick}
      className={cn("block -rotate-[0.2deg]", onClick && "cursor-pointer", className)}
      contentClassName={cn("block", byDensity(density, ["p-2", "p-2.5", "p-3.5"]), densityText(density))}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {title && <span className="block font-bold">{title}</span>}
      {description && <span className="mt-0.5 block text-ink-muted">{description}</span>}
      {children}
      {(assignee || priority !== undefined) && (
        <span className="mt-2 flex items-center gap-2">
          {assignee && <Avatar fallback={assignee} density="Small" />}
          {assignee && <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{assignee}</span>}
          {priority !== undefined && (
            <Badge
              title={PRIORITY_LABEL[Math.min(priority, 4)]}
              color={PRIORITY_COLOR[Math.min(priority, 4)]}
              density="Small"
            />
          )}
        </span>
      )}
    </SketchFrame>
  </div>
);

export interface KanbanProps extends WidgetBaseProps {
  columns?: KanbanColumn[];
  tasks?: KanbanTask[];
  columnWidth?: Sizing;
  showCounts?: boolean;
  /** Render a card yourself; falls back to the built-in `KanbanCard`. */
  renderCard?: (task: KanbanTask) => React.ReactNode;
  onCardMove?: (taskId: string, toColumnId: string) => void;
  onCardClick?: (task: KanbanTask) => void;
}

/**
 * Drag-and-drop board. Mirrors `Ivy.Kanban`.
 *
 * @tags board drag-and-drop columns
 * @example <Kanban columns={columns} tasks={tasks} onCardMove={move} />
 */
export const Kanban = ({
  id,
  columns = [],
  tasks = [],
  width = "100%",
  height = "28rem",
  aspectRatio,
  visible,
  columnWidth = "16rem",
  showCounts = true,
  density = "Medium",
  className,
  style,
  renderCard,
  onCardMove,
  onCardClick,
}: KanbanProps) => {
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);

  const byColumn = (columnId: string) =>
    tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div
      id={id}
      className={cn("flex items-stretch gap-3 overflow-x-auto", densityText(density), className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {columns.map((column) => {
        const cards = byColumn(column.id);
        const full = column.limit !== undefined && cards.length >= column.limit;

        return (
          <SketchFrame
            key={column.id}
            seed={`${id}-${column.id}`}
            corner="rounded"
            stroke={over === column.id ? resolveColor(column.color ?? "Primary") : INK_FAINT}
            strokeWidth={over === column.id ? 1.8 : 1.2}
            fill={over === column.id ? "#fff6c8" : "#f7f6f1"}
            fillStyle="solid"
            className="block shrink-0"
            contentClassName="flex h-full flex-col overflow-hidden"
            style={sizeStyle(columnWidth, "100%")}
            onDragOver={(event: React.DragEvent) => {
              event.preventDefault();
              setOver(column.id);
            }}
            onDragLeave={() => setOver((current) => (current === column.id ? null : current))}
            onDrop={(event: React.DragEvent) => {
              event.preventDefault();
              setOver(null);
              const taskId = dragging ?? event.dataTransfer.getData("text/plain");
              if (taskId && !full) onCardMove?.(taskId, column.id);
              setDragging(null);
            }}
          >
            <div className="flex items-center gap-2 border-b border-dashed border-ink-faint px-3 py-2">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5"
                style={{
                  background: resolveColor(column.color, INK_FAINT),
                  borderRadius: "45% 55% 50% 50%",
                }}
              />
              <span className="min-w-0 flex-1 truncate font-bold">{column.title}</span>
              {showCounts && (
                <span className={cn("text-xs", full ? "font-bold text-destructive" : "text-ink-muted")}>
                  {cards.length}
                  {column.limit !== undefined ? `/${column.limit}` : ""}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-auto p-2">
              {cards.length === 0 && (
                <span className="flex flex-col items-center gap-1 py-6 text-xs text-ink-faint italic">
                  <Icon name="Inbox" size={20} />
                  Drop cards here
                </span>
              )}
              {cards.map((task) =>
                renderCard ? (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(event) => {
                      setDragging(task.id);
                      event.dataTransfer.setData("text/plain", task.id);
                    }}
                  >
                    {renderCard(task)}
                  </div>
                ) : (
                  <KanbanCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    assignee={task.assignee}
                    priority={task.priority}
                    density={density}
                    draggable
                    onDragStart={(event) => {
                      setDragging(task.id);
                      event.dataTransfer.setData("text/plain", task.id);
                    }}
                    onClick={() => onCardClick?.(task)}
                  />
                ),
              )}
            </div>
          </SketchFrame>
        );
      })}
    </div>
  );
};
