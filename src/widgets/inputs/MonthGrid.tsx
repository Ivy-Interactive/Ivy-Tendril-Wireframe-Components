import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { INK, INK_FAINT, STROKE, SURFACE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface MonthGridProps {
  month: Date;
  onMonthChange?: (month: Date) => void;
  selected?: Date[];
  /** Highlights every day between the first and last selected date. */
  range?: boolean;
  min?: Date;
  max?: Date;
  firstDayOfWeek?: WeekDay;
  onSelect?: (day: Date) => void;
  showNavigation?: boolean;
  seed?: string;
  /** Set false to let the grid stretch to its container instead of a fixed 16rem. */
  fixedWidth?: boolean;
}

/**
 * A hand-drawn month, shared by the date inputs and the calendar widget.
 *
 * @internal
 */
export const MonthGrid = ({
  month,
  onMonthChange,
  selected = [],
  range,
  min,
  max,
  firstDayOfWeek = 1,
  onSelect,
  showNavigation = true,
  seed = "month",
  fixedWidth = true,
}: MonthGridProps) => {
  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: firstDayOfWeek });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: firstDayOfWeek });
    return eachDayOfInterval({ start, end });
  }, [month, firstDayOfWeek]);

  const weekdayLabels = days.slice(0, 7).map((day) => format(day, "EEEEE"));
  const today = startOfDay(new Date());
  const sorted = [...selected].sort((a, b) => a.getTime() - b.getTime());
  const rangeStart = sorted[0];
  const rangeEnd = sorted[sorted.length - 1];

  const disabledFor = (day: Date) =>
    (min && isBefore(day, startOfDay(min))) || (max && isAfter(day, startOfDay(max)));

  return (
    <div className={fixedWidth ? "w-64 select-none" : "w-full select-none"}>
      {showNavigation && (
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => onMonthChange?.(addMonths(month, -1))}
            className="cursor-pointer p-1 text-ink-muted hover:text-ink"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <span className="font-bold">{format(month, "MMMM yyyy")}</span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => onMonthChange?.(addMonths(month, 1))}
            className="cursor-pointer p-1 text-ink-muted hover:text-ink"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      )}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-ink-faint uppercase">
        {weekdayLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isSelected = selected.some((entry) => isSameDay(entry, day));
          const inRange =
            range &&
            rangeStart &&
            rangeEnd &&
            !isBefore(day, startOfDay(rangeStart)) &&
            !isAfter(day, startOfDay(rangeEnd));
          const outside = !isSameMonth(day, month);
          const disabled = disabledFor(day);

          const cell = (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(day)}
              aria-selected={isSelected}
              className={cn(
                "flex w-full items-center justify-center text-xs",
                fixedWidth ? "h-8" : "h-full min-h-8",
                outside && "text-ink-faint",
                disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-highlight",
                isSameDay(day, today) && !isSelected && "font-bold sketch-underline",
                inRange && !isSelected && "bg-highlight",
              )}
            >
              {day.getDate()}
            </button>
          );

          return isSelected ? (
            <SketchFrame
              key={day.toISOString()}
              seed={`${seed}-${day.getDate()}`}
              corner="ellipse"
              stroke={INK}
              strokeWidth={STROKE.regular}
              fill={SURFACE.pressed}
              fillStyle="solid"
              className="block"
              contentClassName="block"
            >
              {cell}
            </SketchFrame>
          ) : (
            <React.Fragment key={day.toISOString()}>{cell}</React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const CALENDAR_BORDER = INK_FAINT;
