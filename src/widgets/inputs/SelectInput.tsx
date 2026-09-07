import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { byDensity, cn, densityIconSize, densityText } from "@/lib/utils";
import type { Densities, NullableSelectValue, Option } from "@/lib/types";
import { INK, INK_FAINT, PAPER_RAISED } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { BaseInputProps, InputShell, inputPadding, nativeInputClass } from "./InputShell";
import { BoolInput } from "./BoolInput";
import { SketchSlider } from "./NumberInput";

export type SelectVariant = "Select" | "List" | "Toggle" | "Slider" | "Radio";

export type SearchMode = "CaseInsensitive" | "CaseSensitive" | "Fuzzy";

export interface SelectInputProps extends BaseInputProps {
  value?: NullableSelectValue;
  options?: Option[];
  variant?: SelectVariant;
  /** Turns the control into a multi-select. */
  selectMany?: boolean;
  separator?: string;
  maxSelections?: number;
  minSelections?: number;
  searchable?: boolean | null;
  showActions?: boolean;
  searchMode?: SearchMode;
  emptyMessage?: string;
  loading?: boolean;
  onChange?: (value: NullableSelectValue) => void;
}

const labelOf = (option: Option) => option.label ?? String(option.value);

const asArray = (value: NullableSelectValue): Array<string | number> => {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value];
};

function matches(option: Option, query: string, mode: SearchMode) {
  if (!query) return true;
  const label = labelOf(option);
  if (mode === "CaseSensitive") return label.includes(query);
  if (mode === "Fuzzy") {
    const needle = query.toLowerCase();
    let cursor = 0;
    for (const char of label.toLowerCase()) {
      if (char === needle[cursor]) cursor++;
      if (cursor === needle.length) return true;
    }
    return cursor === needle.length;
  }
  return label.toLowerCase().includes(query.toLowerCase());
}

const OptionRow = ({
  option,
  selected,
  multi,
  density,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  multi: boolean;
  density?: Densities;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    title={option.tooltip}
    disabled={option.disabled}
    onClick={onSelect}
    className={cn(
      "flex w-full items-center gap-2 text-left",
      inputPadding(density),
      option.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-highlight",
      selected && "bg-highlight",
    )}
  >
    {multi ? (
      <Icon name={selected ? "SquareCheck" : "Square"} size={densityIconSize(density)} />
    ) : (
      <Icon
        name="Check"
        size={densityIconSize(density)}
        className={cn(!selected && "invisible")}
      />
    )}
    {option.icon && <Icon name={option.icon} size={densityIconSize(density)} />}
    <span className="block min-w-0 flex-1">
      <span className="block truncate">{labelOf(option)}</span>
      {option.description && (
        <span className="block truncate text-xs text-ink-muted">{option.description}</span>
      )}
    </span>
  </button>
);

/**
 * Every selection variant Ivy ships: dropdown, inline list, toggle group,
 * radio group and a stepped slider. Mirrors `Ivy.SelectInput`.
 */
export const SelectInput = ({
  id,
  value,
  options = [],
  variant = "Select",
  selectMany = false,
  separator = ", ",
  maxSelections,
  minSelections,
  searchable,
  showActions,
  searchMode = "CaseInsensitive",
  emptyMessage = "No options",
  loading,
  placeholder = "Select…",
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "16rem",
  autoFocus,
  prefix,
  suffix,
  className,
  style,
  onChange,
}: SelectInputProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selected = asArray(value);
  const iconSize = densityIconSize(density);

  const visible = React.useMemo(
    () => options.filter((option) => matches(option, query, searchMode)),
    [options, query, searchMode],
  );

  const grouped = React.useMemo(() => {
    const groups = new Map<string, Option[]>();
    visible.forEach((option) => {
      const key = option.group ?? "";
      groups.set(key, [...(groups.get(key) ?? []), option]);
    });
    return [...groups.entries()];
  }, [visible]);

  const emit = (next: Array<string | number>) => {
    if (selectMany) return onChange?.(next as string[] | number[]);
    onChange?.(next[0] ?? null);
  };

  const pick = (option: Option) => {
    if (!selectMany) {
      const next = nullable && selected.includes(option.value) ? [] : [option.value];
      emit(next);
      setOpen(false);
      return;
    }
    const isSelected = selected.includes(option.value);
    if (isSelected) {
      if (minSelections !== undefined && selected.length <= minSelections) return;
      emit(selected.filter((entry) => entry !== option.value));
    } else {
      if (maxSelections !== undefined && selected.length >= maxSelections) return;
      emit([...selected, option.value]);
    }
  };

  const summary = selected
    .map((entry) => labelOf(options.find((option) => option.value === entry) ?? { value: entry }))
    .join(separator);

  if (variant === "Radio" || variant === "List") {
    const body = (
      <div role="listbox" className={cn("flex flex-col", variant === "Radio" && "gap-1")}>
        {visible.length === 0 && (
          <span className={cn("text-ink-faint italic", inputPadding(density))}>{emptyMessage}</span>
        )}
        {visible.map((option) =>
          variant === "Radio" ? (
            <label
              key={option.value}
              className={cn(
                "flex items-center gap-2",
                option.disabled || disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
              )}
            >
              <SketchFrame
                as="button"
                type="button"
                seed={`${id}-${option.value}`}
                corner="ellipse"
                stroke={selected.includes(option.value) ? INK : INK_FAINT}
                fill={PAPER_RAISED}
                fillStyle="solid"
                role="radio"
                aria-checked={selected.includes(option.value)}
                disabled={disabled || option.disabled}
                onClick={() => pick(option)}
                className="shrink-0"
                contentClassName="flex h-full w-full items-center justify-center"
                style={{ width: iconSize + 4, height: iconSize + 4 }}
              >
                {selected.includes(option.value) && (
                  <span
                    className="block rounded-full"
                    style={{ width: iconSize - 6, height: iconSize - 6, background: INK }}
                  />
                )}
              </SketchFrame>
              <span>
                <span className="block leading-tight">{labelOf(option)}</span>
                {option.description && (
                  <span className="block text-xs text-ink-muted">{option.description}</span>
                )}
              </span>
            </label>
          ) : (
            <OptionRow
              key={option.value}
              option={option}
              selected={selected.includes(option.value)}
              multi={selectMany}
              density={density}
              onSelect={() => pick(option)}
            />
          ),
        )}
      </div>
    );

    return (
      <div
        id={id}
        className={cn("inline-flex flex-col gap-1", densityText(density), className)}
        style={{ width: typeof width === "string" ? width : undefined, ...style }}
      >
        {variant === "List" ? (
          <SketchFrame
            seed={id ?? "select-list"}
            stroke={invalid ? "#b04a3f" : INK_FAINT}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className="block w-full"
            contentClassName="block max-h-64 overflow-auto py-1"
          >
            {body}
          </SketchFrame>
        ) : (
          body
        )}
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
    );
  }

  if (variant === "Toggle") {
    return (
      <div
        id={id}
        className={cn("inline-flex flex-col gap-1", className)}
        style={style}
        role="group"
      >
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => (
            <BoolInput
              key={option.value}
              variant="Toggle"
              label={labelOf(option)}
              icon={option.icon}
              value={selected.includes(option.value)}
              disabled={disabled || option.disabled}
              density={density}
              onChange={() => pick(option)}
            />
          ))}
        </div>
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
    );
  }

  if (variant === "Slider") {
    const index = Math.max(0, options.findIndex((option) => option.value === selected[0]));
    return (
      <div
        id={id}
        className={cn("inline-flex flex-col gap-1", densityText(density), className)}
        style={{ width: typeof width === "string" ? width : undefined, ...style }}
      >
        <SketchSlider
          seed={id ?? "select-slider"}
          value={index}
          min={0}
          max={Math.max(0, options.length - 1)}
          step={1}
          disabled={disabled}
          onChange={(next) => options[next] && emit([options[next].value])}
        />
        <div className="flex justify-between text-[10px] text-ink-faint">
          {options.map((option, optionIndex) => (
            <span key={option.value} className={cn(optionIndex === index && "font-bold text-ink")}>
              {labelOf(option)}
            </span>
          ))}
        </div>
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
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
            focused={open}
            prefix={prefix}
            className={className}
            style={style}
            showClear={Boolean(nullable && selected.length)}
            onClear={() => emit([])}
            onClick={() => !disabled && setOpen(true)}
            suffix={
              <>
                {suffix}
                {loading ? (
                  <Icon name="LoaderCircle" size={iconSize} className="animate-spin" />
                ) : (
                  <Icon
                    name="ChevronDown"
                    size={iconSize}
                    className={cn("transition-transform", open && "rotate-180")}
                  />
                )}
              </>
            }
          >
            <span
              role="combobox"
              aria-expanded={open}
              tabIndex={disabled ? -1 : 0}
              autoFocus={autoFocus}
              className={cn("block w-full cursor-pointer truncate", !summary && "text-ink-faint italic")}
            >
              {summary || placeholder}
            </span>
          </InputShell>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50">
          <SketchFrame
            seed={`${id}-options`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril min-w-52", densityText(density))}
            contentClassName="block max-h-72 overflow-auto py-1"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            {searchable !== false && options.length > 6 && (
              <div className={cn("flex items-center gap-2 border-b border-dashed border-ink-faint", inputPadding(density))}>
                <Icon name="Search" size={iconSize} color={INK_FAINT} />
                <input
                  autoFocus
                  value={query}
                  placeholder="Filter…"
                  onChange={(event) => setQuery(event.target.value)}
                  className={nativeInputClass}
                />
              </div>
            )}
            {visible.length === 0 && (
              <span className={cn("block text-ink-faint italic", inputPadding(density))}>
                {emptyMessage}
              </span>
            )}
            {grouped.map(([group, groupOptions]) => (
              <div key={group || "ungrouped"}>
                {group && (
                  <div className="px-2.5 pt-2 pb-1 text-[10px] tracking-widest text-ink-faint uppercase">
                    {group}
                  </div>
                )}
                {groupOptions.map((option) => (
                  <OptionRow
                    key={option.value}
                    option={option}
                    selected={selected.includes(option.value)}
                    multi={selectMany}
                    density={density}
                    onSelect={() => pick(option)}
                  />
                ))}
              </div>
            ))}
            {selectMany && showActions && (
              <div
                className={cn(
                  "flex justify-between gap-2 border-t border-dashed border-ink-faint text-xs",
                  byDensity(density, ["px-2 py-1", "px-2.5 py-1.5", "px-3 py-2"]),
                )}
              >
                <button
                  type="button"
                  className="cursor-pointer sketch-underline"
                  onClick={() => emit(options.filter((option) => !option.disabled).map((option) => option.value))}
                >
                  Select all
                </button>
                <button type="button" className="cursor-pointer sketch-underline" onClick={() => emit([])}>
                  Clear
                </button>
              </div>
            )}
          </SketchFrame>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export interface AsyncSelectInputProps extends BaseInputProps {
  /** Label of the currently selected item; the value itself lives upstream. */
  displayValue?: string;
  loading?: boolean;
  options?: Option[];
  onQueryChange?: (query: string) => void;
  onChange?: (value: string | number | null) => void;
}

/** A select whose options are fetched as you type. Mirrors `Ivy.AsyncSelectInput`. */
export const AsyncSelectInput = ({
  id,
  displayValue,
  loading,
  options = [],
  placeholder = "Search…",
  disabled,
  invalid,
  density = "Medium",
  ghost,
  width = "16rem",
  autoFocus,
  nullable,
  className,
  style,
  onQueryChange,
  onChange,
}: AsyncSelectInputProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const iconSize = densityIconSize(density);

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
            focused={open}
            className={className}
            style={style}
            showClear={Boolean(nullable && displayValue)}
            onClear={() => onChange?.(null)}
            onClick={() => !disabled && setOpen(true)}
            suffix={
              loading ? (
                <Icon name="LoaderCircle" size={iconSize} className="animate-spin" />
              ) : (
                <Icon name="ChevronsUpDown" size={iconSize} />
              )
            }
          >
            <span
              role="combobox"
              aria-expanded={open}
              tabIndex={disabled ? -1 : 0}
              autoFocus={autoFocus}
              className={cn("block w-full cursor-pointer truncate", !displayValue && "text-ink-faint italic")}
            >
              {displayValue || placeholder}
            </span>
          </InputShell>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50">
          <SketchFrame
            seed={`${id}-async`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril min-w-52", densityText(density))}
            contentClassName="block max-h-72 overflow-auto py-1"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <div className={cn("flex items-center gap-2 border-b border-dashed border-ink-faint", inputPadding(density))}>
              <Icon name="Search" size={iconSize} color={INK_FAINT} />
              <input
                autoFocus
                value={query}
                placeholder="Type to search…"
                onChange={(event) => {
                  setQuery(event.target.value);
                  onQueryChange?.(event.target.value);
                }}
                className={nativeInputClass}
              />
            </div>
            {loading && (
              <span className={cn("block text-ink-faint italic", inputPadding(density))}>Searching…</span>
            )}
            {!loading && options.length === 0 && (
              <span className={cn("block text-ink-faint italic", inputPadding(density))}>No matches</span>
            )}
            {options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                selected={labelOf(option) === displayValue}
                multi={false}
                density={density}
                onSelect={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
              />
            ))}
          </SketchFrame>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
