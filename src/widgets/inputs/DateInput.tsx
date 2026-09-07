import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { cn, densityIconSize, densityText } from "@/lib/utils";
import { PAPER_RAISED } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { BaseInputProps, InputShell, nativeInputClass } from "./InputShell";
import { MonthGrid, type WeekDay } from "./MonthGrid";

export type DateTimeVariant = "Date" | "DateTime" | "Time" | "Month" | "Week" | "Year";

const DEFAULT_FORMAT: Record<DateTimeVariant, string> = {
  Date: "yyyy-MM-dd",
  DateTime: "yyyy-MM-dd HH:mm",
  Time: "HH:mm",
  Month: "yyyy-MM",
  Week: "yyyy-'W'II",
  Year: "yyyy",
};

const parse = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export interface DateTimeInputProps extends BaseInputProps {
  /** ISO 8601 string, e.g. `"2026-04-20"` or `"2026-04-20T09:30"`. */
  value?: string | null;
  variant?: DateTimeVariant;
  format?: string;
  firstDayOfWeek?: WeekDay;
  min?: string;
  max?: string;
  step?: string;
  onChange?: (value: string | null) => void;
}

/** Date, time and month pickers. Mirrors `Ivy.DateTimeInput`. */
export const DateTimeInput = ({
  id,
  value,
  variant = "Date",
  format: pattern,
  firstDayOfWeek = 1,
  min,
  max,
  step,
  placeholder,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "14rem",
  height,
  aspectRatio,
  visible,
  autoFocus,
  prefix,
  suffix,
  className,
  style,
  onChange,
}: DateTimeInputProps) => {
  const [open, setOpen] = React.useState(false);
  const parsed = parse(value);
  const [month, setMonth] = React.useState(() => parsed ?? new Date());
  const iconSize = densityIconSize(density);
  const display = parsed ? format(parsed, pattern ?? DEFAULT_FORMAT[variant]) : "";

  if (variant === "Time") {
    return (
      <InputShell
        id={id ? `${id}-shell` : undefined}
        disabled={disabled}
        invalid={invalid}
        density={density}
        ghost={ghost}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        visible={visible}
        prefix={prefix ?? <Icon name="Clock" size={iconSize} />}
        suffix={suffix}
        showClear={Boolean(nullable && value)}
        onClear={() => onChange?.(null)}
        className={className}
        style={style}
      >
        <input
          id={id}
          type="time"
          step={step}
          value={value ?? ""}
          disabled={disabled}
          autoFocus={autoFocus}
          className={nativeInputClass}
          onChange={(event) => onChange?.(event.target.value || null)}
        />
      </InputShell>
    );
  }

  if (variant === "Month" || variant === "Week" || variant === "Year") {
    const nativeType = variant === "Year" ? "number" : variant === "Week" ? "week" : "month";
    return (
      <InputShell
        id={id ? `${id}-shell` : undefined}
        disabled={disabled}
        invalid={invalid}
        density={density}
        ghost={ghost}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        visible={visible}
        prefix={prefix ?? <Icon name="Calendar" size={iconSize} />}
        suffix={suffix}
        showClear={Boolean(nullable && value)}
        onClear={() => onChange?.(null)}
        className={className}
        style={style}
      >
        <input
          id={id}
          type={nativeType}
          min={min}
          max={max}
          value={value ?? ""}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={nativeInputClass}
          onChange={(event) => onChange?.(event.target.value || null)}
        />
      </InputShell>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <div>
          <InputShell
            id={id}
            disabled={disabled}
            invalid={invalid}
            density={density}
            ghost={ghost}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            visible={visible}
            focused={open}
            prefix={prefix ?? <Icon name="Calendar" size={iconSize} />}
            suffix={suffix}
            showClear={Boolean(nullable && value)}
            onClear={() => onChange?.(null)}
            onClick={() => !disabled && setOpen(true)}
            className={className}
            style={style}
          >
            <span
              tabIndex={disabled ? -1 : 0}
              autoFocus={autoFocus}
              className={cn("block w-full cursor-pointer truncate", !display && "text-ink-faint italic")}
            >
              {display || placeholder || DEFAULT_FORMAT[variant].toLowerCase()}
            </span>
          </InputShell>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50">
          <SketchFrame
            seed={`${id}-calendar`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril", densityText(density))}
            contentClassName="p-3"
          >
            <MonthGrid
              seed={`${id}-grid`}
              month={month}
              onMonthChange={setMonth}
              selected={parsed ? [parsed] : []}
              min={parse(min) ?? undefined}
              max={parse(max) ?? undefined}
              firstDayOfWeek={firstDayOfWeek}
              onSelect={(day) => {
                const iso =
                  variant === "DateTime"
                    ? format(day, "yyyy-MM-dd'T'HH:mm")
                    : format(startOfDay(day), "yyyy-MM-dd");
                onChange?.(iso);
                setOpen(false);
              }}
            />
            {variant === "DateTime" && (
              <div className="mt-2 flex items-center gap-2 border-t border-dashed border-ink-faint pt-2">
                <Icon name="Clock" size={iconSize} />
                <input
                  type="time"
                  value={parsed ? format(parsed, "HH:mm") : ""}
                  className={nativeInputClass}
                  onChange={(event) => {
                    const base = parsed ?? new Date();
                    const [hours, minutes] = event.target.value.split(":").map(Number);
                    const next = new Date(base);
                    next.setHours(hours || 0, minutes || 0, 0, 0);
                    onChange?.(format(next, "yyyy-MM-dd'T'HH:mm"));
                  }}
                />
              </div>
            )}
          </SketchFrame>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export interface DateRangeValue {
  item1: string | null;
  item2: string | null;
}

export interface DateRangeInputProps extends BaseInputProps {
  value?: DateRangeValue | null;
  format?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  firstDayOfWeek?: WeekDay;
  min?: string | null;
  max?: string | null;
  onChange?: (value: DateRangeValue | null) => void;
}

/** Start and end date in one popover. Mirrors `Ivy.DateRangeInput`. */
export const DateRangeInput = ({
  id,
  value,
  format: pattern = "yyyy-MM-dd",
  startPlaceholder = "Start",
  endPlaceholder = "End",
  firstDayOfWeek = 1,
  min,
  max,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "20rem",
  height,
  aspectRatio,
  visible,
  prefix,
  suffix,
  className,
  style,
  onChange,
}: DateRangeInputProps) => {
  const [open, setOpen] = React.useState(false);
  const start = parse(value?.item1);
  const end = parse(value?.item2);
  const [month, setMonth] = React.useState(() => start ?? new Date());
  const iconSize = densityIconSize(density);

  const pick = (day: Date) => {
    if (!start || (start && end)) {
      onChange?.({ item1: format(day, "yyyy-MM-dd"), item2: null });
      return;
    }
    const [from, to] = day < start ? [day, start] : [start, day];
    onChange?.({ item1: format(from, "yyyy-MM-dd"), item2: format(to, "yyyy-MM-dd") });
    setOpen(false);
  };

  const display =
    start || end
      ? `${start ? format(start, pattern) : startPlaceholder} → ${end ? format(end, pattern) : endPlaceholder}`
      : "";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <div>
          <InputShell
            id={id}
            disabled={disabled}
            invalid={invalid}
            density={density}
            ghost={ghost}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            visible={visible}
            focused={open}
            prefix={prefix ?? <Icon name="CalendarRange" size={iconSize} />}
            suffix={suffix}
            showClear={Boolean(nullable && (start || end))}
            onClear={() => onChange?.(null)}
            onClick={() => !disabled && setOpen(true)}
            className={className}
            style={style}
          >
            <span
              className={cn("block w-full cursor-pointer truncate", !display && "text-ink-faint italic")}
            >
              {display || `${startPlaceholder} → ${endPlaceholder}`}
            </span>
          </InputShell>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50">
          <SketchFrame
            seed={`${id}-range`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril", densityText(density))}
            contentClassName="p-3"
          >
            <MonthGrid
              seed={`${id}-range-grid`}
              month={month}
              onMonthChange={setMonth}
              selected={[start, end].filter(Boolean) as Date[]}
              range
              min={parse(min) ?? undefined}
              max={parse(max) ?? undefined}
              firstDayOfWeek={firstDayOfWeek}
              onSelect={pick}
            />
          </SketchFrame>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
