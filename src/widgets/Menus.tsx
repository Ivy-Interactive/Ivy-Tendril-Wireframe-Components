import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { byDensity, cn, densityIconSize, densityText, widgetStyle } from "@/lib/utils";
import type { Densities, MenuItem, WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, INK_MUTED, PAPER_RAISED, resolveColor, tint } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

const itemPadding = (density?: Densities) =>
  byDensity(density, ["px-2 py-1", "px-2.5 py-1.5", "px-3 py-2"]);

/** Shared row renderer for dropdowns, toolbars and trees. */
const MenuRow = ({
  item,
  density,
  iconSize,
  onSelect,
}: {
  item: MenuItem;
  density?: Densities;
  iconSize: number;
  onSelect: (item: MenuItem) => void;
}) => {
  const color = item.color ? resolveColor(item.color) : undefined;
  return (
    <button
      type="button"
      role="menuitem"
      title={item.tooltip}
      disabled={item.disabled}
      onClick={() => onSelect(item)}
      className={cn(
        "flex w-full items-center gap-2 text-left whitespace-nowrap",
        itemPadding(density),
        item.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-highlight",
      )}
      style={{ color }}
    >
      {item.variant === "Checkbox" && (
        <Icon name={item.checked ? "SquareCheck" : "Square"} size={iconSize} />
      )}
      {item.variant === "Radio" && (
        <Icon name={item.checked ? "CircleDot" : "Circle"} size={iconSize} />
      )}
      {item.icon && item.variant !== "Checkbox" && item.variant !== "Radio" && (
        <Icon name={item.icon} size={iconSize} />
      )}
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full border border-current px-1.5 text-[10px]">{item.badge}</span>
      )}
      {item.shortcut && <span className="font-sketch-mono text-[10px] text-ink-faint">{item.shortcut}</span>}
      {item.children?.length ? <Icon name="ChevronRight" size={iconSize} color={INK_FAINT} /> : null}
    </button>
  );
};

const MenuList = ({
  items,
  density,
  onSelect,
}: {
  items: MenuItem[];
  density?: Densities;
  onSelect: (item: MenuItem) => void;
}) => {
  const iconSize = densityIconSize(density);
  return (
    <>
      {items.map((item, index) => {
        if (item.variant === "Separator") {
          return (
            <div key={`sep-${index}`} className="my-1 border-t border-dashed border-ink-faint" />
          );
        }
        if (item.variant === "Group") {
          return (
            <div key={`group-${index}`} className="py-1">
              <div className="px-2.5 pb-1 text-[10px] tracking-widest text-ink-faint uppercase">
                {item.label}
              </div>
              {item.children?.map((child, childIndex) => (
                <MenuRow
                  key={`${child.label}-${childIndex}`}
                  item={child}
                  density={density}
                  iconSize={iconSize}
                  onSelect={onSelect}
                />
              ))}
            </div>
          );
        }
        return (
          <MenuRow
            key={`${item.label}-${index}`}
            item={item}
            density={density}
            iconSize={iconSize}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
};

export interface DropDownMenuProps extends WidgetBaseProps {
  items?: MenuItem[];
  /** The element the menu hangs off. */
  trigger?: React.ReactNode;
  header?: React.ReactNode;
  align?: "Start" | "Center" | "End";
  side?: "Top" | "Right" | "Bottom" | "Left";
  alignOffset?: number;
  /** Keeps the menu open after a selection, for multi-select menus. */
  stayOpen?: boolean;
  onSelect?: (item: MenuItem) => void;
}

/** A menu anchored to a trigger. Mirrors `Ivy.DropDownMenu`. */
export const DropDownMenu = ({
  id,
  items = [],
  trigger,
  header,
  align = "Start",
  side = "Bottom",
  alignOffset = 0,
  stayOpen,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
}: DropDownMenuProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (item: MenuItem) => {
    item.onSelect?.(item);
    onSelect?.(item);
    if (!stayOpen) setOpen(false);
  };

  return (
    <DropdownPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownPrimitive.Trigger asChild>
        <span
          id={id}
          className={cn("inline-flex", className)}
          style={widgetStyle({ aspectRatio, visible, style })}
        >
          {trigger}
        </span>
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          side={side.toLowerCase() as "top" | "right" | "bottom" | "left"}
          align={align.toLowerCase() as "start" | "center" | "end"}
          alignOffset={alignOffset}
          sideOffset={6}
          className="z-50"
        >
          <SketchFrame
            seed={`${id}-menu`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril min-w-44", densityText(density))}
            contentClassName="py-1"
            style={widgetStyle({ width, height })}
          >
            {header && (
              <div className="border-b border-dashed border-ink-faint px-2.5 pb-1.5 text-xs text-ink-muted">
                {header}
              </div>
            )}
            <MenuList items={items} density={density} onSelect={handleSelect} />
          </SketchFrame>
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
};

export interface ToolbarProps extends WidgetBaseProps {
  items?: MenuItem[];
  disabled?: boolean;
  onSelect?: (item: MenuItem) => void;
}

/** A row of icon buttons and dropdowns. Mirrors `Ivy.Toolbar`. */
export const Toolbar = ({
  id,
  items = [],
  disabled,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
}: ToolbarProps) => {
  const iconSize = densityIconSize(density);

  return (
    <SketchFrame
      id={id}
      seed={id ?? "toolbar"}
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("inline-block", densityText(density), className)}
      contentClassName={cn("flex items-center gap-0.5", byDensity(density, ["p-0.5", "p-1", "p-1.5"]))}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      role="toolbar"
    >
      {items.map((item, index) => {
        if (item.variant === "Separator") {
          return (
            <span key={`sep-${index}`} className="mx-1 h-5 w-px self-stretch bg-ink-faint" />
          );
        }

        const button = (
          <button
            type="button"
            title={item.tooltip ?? item.label}
            disabled={disabled || item.disabled}
            onClick={() => {
              item.onSelect?.(item);
              onSelect?.(item);
            }}
            aria-pressed={item.variant === "Checkbox" ? item.checked : undefined}
            className={cn(
              "flex items-center gap-1.5",
              itemPadding(density),
              item.checked && "bg-highlight font-bold",
              disabled || item.disabled
                ? "cursor-not-allowed opacity-45"
                : "cursor-pointer hover:bg-highlight",
            )}
            style={{ color: item.color ? resolveColor(item.color) : undefined }}
          >
            {item.icon && <Icon name={item.icon} size={iconSize} />}
            {item.label && !item.icon && <span>{item.label}</span>}
            {item.icon && item.label && <span className="hidden sm:inline">{item.label}</span>}
          </button>
        );

        if (item.children?.length) {
          return (
            <DropDownMenu
              key={`${item.label}-${index}`}
              id={`${id}-${index}`}
              items={item.children}
              density={density}
              trigger={button}
              onSelect={onSelect}
            />
          );
        }

        return <React.Fragment key={`${item.label}-${index}`}>{button}</React.Fragment>;
      })}
    </SketchFrame>
  );
};

export type TooltipVariant = "Default" | "Info" | "Success" | "Warning" | "Error";

const TOOLTIP_COLOR: Record<TooltipVariant, string> = {
  Default: INK,
  Info: resolveColor("Info"),
  Success: resolveColor("Success"),
  Warning: resolveColor("Warning"),
  Error: resolveColor("Destructive"),
};

export interface TooltipProps extends WidgetBaseProps {
  /** Element the tooltip describes. */
  trigger?: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  showArrow?: boolean;
  /** Keeps the tooltip up while the pointer is over it. */
  persistent?: boolean;
  variant?: TooltipVariant;
  side?: "Top" | "Right" | "Bottom" | "Left";
}

/** Hover hint on a sticky-note. Mirrors `Ivy.Tooltip`. */
export const Tooltip = ({
  id,
  trigger,
  content,
  children,
  density = "Medium",
  open,
  showArrow = true,
  persistent,
  variant = "Default",
  side = "Top",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: TooltipProps) => {
  const color = TOOLTIP_COLOR[variant];

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={open} disableHoverableContent={!persistent}>
        <TooltipPrimitive.Trigger asChild>
          <span
            id={id}
            className={cn("inline-flex", className)}
            style={widgetStyle({ width, height, aspectRatio, visible, style })}
          >
            {trigger ?? children}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side.toLowerCase() as "top" | "right" | "bottom" | "left"}
            sideOffset={8}
            className="z-50"
          >
            <SketchFrame
              seed={`${id}-tooltip`}
              corner="rounded"
              stroke={color}
              fill={tint(color, 0.9)}
              fillStyle="solid"
              className={cn("tendril max-w-64", densityText(density))}
              contentClassName={itemPadding(density)}
            >
              {content ?? (trigger ? children : null)}
            </SketchFrame>
            {showArrow && <TooltipPrimitive.Arrow width={11} height={5} style={{ fill: color }} />}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export interface TreeProps extends WidgetBaseProps {
  items?: MenuItem[];
  rowActions?: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  onRowAction?: (item: MenuItem, action: MenuItem) => void;
}

const TreeNode = ({
  item,
  depth,
  density,
  rowActions,
  onSelect,
  onRowAction,
}: {
  item: MenuItem;
  depth: number;
  density?: Densities;
  rowActions?: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  onRowAction?: (item: MenuItem, action: MenuItem) => void;
}) => {
  const [expanded, setExpanded] = React.useState(item.expanded ?? false);
  const hasChildren = Boolean(item.children?.length);
  const iconSize = densityIconSize(density);

  return (
    <li className="list-none">
      <div
        className={cn(
          "group flex items-center gap-1.5",
          itemPadding(density),
          item.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-highlight",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <button
          type="button"
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={() => hasChildren && setExpanded((value) => !value)}
          className={cn("shrink-0", !hasChildren && "invisible")}
        >
          <Icon
            name="ChevronRight"
            size={iconSize}
            color={INK_MUTED}
            className={cn("transition-transform", expanded && "rotate-90")}
          />
        </button>
        <button
          type="button"
          title={item.tooltip}
          disabled={item.disabled}
          onClick={() => {
            item.onSelect?.(item);
            onSelect?.(item);
          }}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          style={{ color: item.color ? resolveColor(item.color) : undefined }}
        >
          {item.icon && <Icon name={item.icon} size={iconSize} />}
          <span className="truncate">{item.label}</span>
          {item.tag && <span className="text-[10px] text-ink-faint">{item.tag}</span>}
        </button>
        {rowActions?.length ? (
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <DropDownMenu
              items={rowActions}
              density={density}
              onSelect={(action) => onRowAction?.(item, action)}
              trigger={
                <button type="button" aria-label="Row actions" className="px-1">
                  <Icon name="Ellipsis" size={iconSize} color={INK_MUTED} />
                </button>
              }
            />
          </span>
        ) : null}
      </div>
      {hasChildren && expanded && (
        <ul className="m-0 p-0">
          {item.children!.map((child, index) => (
            <TreeNode
              key={`${child.label}-${index}`}
              item={child}
              depth={depth + 1}
              density={density}
              rowActions={rowActions}
              onSelect={onSelect}
              onRowAction={onRowAction}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

/** Nested, collapsible rows. Mirrors `Ivy.Tree`. */
export const Tree = ({
  id,
  items = [],
  rowActions,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
  onRowAction,
}: TreeProps) => (
  <ul
    id={id}
    role="tree"
    className={cn("m-0 list-none p-0", densityText(density), className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    {items.map((item, index) => (
      <TreeNode
        key={`${item.label}-${index}`}
        item={item}
        depth={0}
        density={density}
        rowActions={rowActions}
        onSelect={onSelect}
        onRowAction={onRowAction}
      />
    ))}
  </ul>
);
