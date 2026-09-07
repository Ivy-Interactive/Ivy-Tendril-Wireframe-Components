import * as React from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { byDensity, cn, densityText, sizeStyle } from "@/lib/utils";
import type { Densities, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { MonthGrid, type WeekDay } from "./inputs/MonthGrid";
import { Button } from "./Button";

export type CalendarView = "Month" | "Week" | "Day" | "Agenda";

export interface CalendarEvent {
  eventId: string;
  title?: string;
  /** ISO 8601 date-time. */
  start: string;
  end?: string;
  color?: string;
  allDay?: boolean;
}

export interface CalendarEventProps extends WidgetBaseProps, CalendarEvent {
  children?: React.ReactNode;
}

/**
 * Declarative event definition. Mirrors `Ivy.CalendarEvent`; it renders
 * nothing on its own — pass events to `Calendar` via the `events` prop.
 */
export const CalendarEventWidget = (_: CalendarEventProps) => null;

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const EventPill = ({
  event,
  compact,
  onClick,
}: {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}) => {
  const color = resolveColor(event.color, "#3f6fa8");
  return (
    <button
      type="button"
      title={event.title}
      onClick={() => onClick?.(event)}
      className={cn(
        "block w-full cursor-pointer truncate border px-1 text-left text-[11px] leading-tight",
        compact ? "py-0" : "py-0.5",
      )}
      style={{
        borderColor: color,
        background: tint(color, 0.88),
        color,
        borderRadius: "6px 3px 7px 4px",
      }}
    >
      {!event.allDay && <span className="mr-1 opacity-70">{format(parseISO(event.start), "HH:mm")}</span>}
      {event.title}
    </button>
  );
};

export interface CalendarProps extends WidgetBaseProps {
  events?: CalendarEvent[];
  defaultView?: CalendarView;
  /** ISO date the calendar opens on. */
  defaultDate?: string;
  enableDragDrop?: boolean;
  showToolbar?: boolean;
  firstDayOfWeek?: WeekDay;
  density?: Densities;
  width?: Sizing;
  height?: Sizing;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMove?: (eventId: string, start: string, end: string | undefined) => void;
  onSelectSlot?: (start: string, end: string) => void;
  onViewChange?: (view: CalendarView) => void;
}

/** Month, week, day and agenda views. Mirrors `Ivy.Calendar`. */
export const Calendar = ({
  id,
  events = [],
  defaultView = "Month",
  defaultDate,
  enableDragDrop,
  showToolbar = true,
  firstDayOfWeek = 1,
  density = "Medium",
  width = "100%",
  height = "32rem",
  className,
  style,
  onEventClick,
  onEventMove,
  onSelectSlot,
  onViewChange,
}: CalendarProps) => {
  const [view, setView] = React.useState<CalendarView>(defaultView);
  const [cursor, setCursor] = React.useState(() =>
    defaultDate ? parseISO(defaultDate) : new Date(),
  );
  const [dragged, setDragged] = React.useState<string | null>(null);

  const eventsOn = (day: Date) =>
    events.filter((event) => isSameDay(parseISO(event.start), day));

  const changeView = (next: CalendarView) => {
    setView(next);
    onViewChange?.(next);
  };

  const navigate = (direction: -1 | 0 | 1) => {
    if (direction === 0) return setCursor(new Date());
    if (view === "Month") return setCursor(addMonths(cursor, direction));
    if (view === "Week") return setCursor(addWeeks(cursor, direction));
    setCursor(addDays(cursor, direction));
  };

  const dropOn = (day: Date) => {
    if (!dragged) return;
    const event = events.find((entry) => entry.eventId === dragged);
    if (!event) return;
    const original = parseISO(event.start);
    const next = new Date(day);
    next.setHours(original.getHours(), original.getMinutes(), 0, 0);
    onEventMove?.(event.eventId, next.toISOString(), event.end);
    setDragged(null);
  };

  const weekDays = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(cursor, { weekStartsOn: firstDayOfWeek }),
        end: endOfWeek(cursor, { weekStartsOn: firstDayOfWeek }),
      }),
    [cursor, firstDayOfWeek],
  );

  const title =
    view === "Month"
      ? format(cursor, "MMMM yyyy")
      : view === "Week"
        ? `${format(weekDays[0], "d MMM")} – ${format(weekDays[6], "d MMM yyyy")}`
        : format(cursor, "EEEE d MMMM yyyy");

  const dayColumns = view === "Week" ? weekDays : [cursor];

  return (
    <SketchFrame
      id={id}
      seed={id ?? "calendar"}
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("block", densityText(density), className)}
      contentClassName="flex h-full flex-col overflow-hidden"
      style={{ ...sizeStyle(width, height), ...style }}
    >
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink-faint px-3 py-2">
          <Button variant="Outline" icon="ChevronLeft" density="Small" onClick={() => navigate(-1)} title="" />
          <Button variant="Outline" title="Today" density="Small" onClick={() => navigate(0)} />
          <Button variant="Outline" icon="ChevronRight" density="Small" onClick={() => navigate(1)} title="" />
          <span className="ml-2 min-w-0 flex-1 truncate font-bold">{title}</span>
          <span className="flex gap-1">
            {(["Month", "Week", "Day", "Agenda"] as CalendarView[]).map((option) => (
              <Button
                key={option}
                title={option}
                density="Small"
                variant={view === option ? "Primary" : "Ghost"}
                onClick={() => changeView(option)}
              />
            ))}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {view === "Month" && (
          <div className="h-full">
            <MonthGrid
              fixedWidth={false}
              seed={`${id}-month`}
              month={cursor}
              onMonthChange={setCursor}
              firstDayOfWeek={firstDayOfWeek}
              showNavigation={false}
              onSelect={(day) => onSelectSlot?.(day.toISOString(), addDays(day, 1).toISOString())}
            />
          </div>
        )}

        {(view === "Week" || view === "Day") && (
          <div className="min-w-[36rem]">
            <div
              className="grid border-b border-dashed border-ink-faint"
              style={{ gridTemplateColumns: `3rem repeat(${dayColumns.length}, minmax(0, 1fr))` }}
            >
              <span />
              {dayColumns.map((day) => (
                <span key={day.toISOString()} className="px-1 pb-1 text-center text-xs font-bold">
                  {format(day, "EEE d")}
                </span>
              ))}
            </div>
            <div
              className="grid"
              style={{ gridTemplateColumns: `3rem repeat(${dayColumns.length}, minmax(0, 1fr))` }}
            >
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <span className="border-b border-dashed border-ink-faint py-1 pr-1 text-right text-[10px] text-ink-faint">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                  {dayColumns.map((day) => {
                    const slotEvents = eventsOn(day).filter(
                      (event) => parseISO(event.start).getHours() === hour,
                    );
                    return (
                      <span
                        key={`${day.toISOString()}-${hour}`}
                        className="min-h-7 border-b border-l border-dashed border-ink-faint p-0.5"
                        onDragOver={enableDragDrop ? (event) => event.preventDefault() : undefined}
                        onDrop={
                          enableDragDrop
                            ? () => {
                                const target = new Date(day);
                                target.setHours(hour, 0, 0, 0);
                                dropOn(target);
                              }
                            : undefined
                        }
                        onClick={() => {
                          const start = new Date(day);
                          start.setHours(hour, 0, 0, 0);
                          onSelectSlot?.(start.toISOString(), addDays(start, 0).toISOString());
                        }}
                      >
                        {slotEvents.map((event) => (
                          <span
                            key={event.eventId}
                            draggable={enableDragDrop}
                            onDragStart={() => setDragged(event.eventId)}
                            className="block"
                          >
                            <EventPill event={event} compact onClick={onEventClick} />
                          </span>
                        ))}
                      </span>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {view === "Agenda" && (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {events.length === 0 && (
              <li className="py-6 text-center text-ink-faint italic">Nothing scheduled</li>
            )}
            {[...events]
              .sort((a, b) => a.start.localeCompare(b.start))
              .map((event) => (
                <li key={event.eventId} className="flex items-start gap-3">
                  <span className="w-28 shrink-0 text-xs text-ink-muted">
                    {format(parseISO(event.start), "EEE d MMM")}
                    <br />
                    {!event.allDay && (
                      <span className="text-ink-faint">{format(parseISO(event.start), "HH:mm")}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <EventPill event={event} onClick={onEventClick} />
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      {view === "Month" && (
        <div
          className={cn(
            "border-t border-dashed border-ink-faint",
            byDensity(density, ["px-2 py-1.5", "px-3 py-2", "px-4 py-3"]),
          )}
        >
          <span className="mb-1 block text-xs font-bold text-ink-muted">
            {format(cursor, "MMMM")} events
          </span>
          <div className="flex flex-wrap gap-1.5">
            {events
              .filter((event) => startOfDay(parseISO(event.start)).getMonth() === cursor.getMonth())
              .map((event) => (
                <span key={event.eventId} className="max-w-48">
                  <EventPill event={event} onClick={onEventClick} />
                </span>
              ))}
            {events.length === 0 && (
              <span className="flex items-center gap-1 text-xs text-ink-faint italic">
                <Icon name="CalendarOff" size={12} /> No events
              </span>
            )}
          </div>
        </div>
      )}
    </SketchFrame>
  );
};
