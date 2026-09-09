import * as React from "react";
import {
  byDensity,
  cn,
  densityIconSize,
  densityText,
  thicknessStyle,
  widgetStyle,
} from "@/lib/utils";
import type { Sizing, Thickness, WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, PAPER_RAISED, STROKE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

/**
 * `Tabs` draws the strip as boxed, browser-style tabs sitting on the panel.
 * `Content` is the quieter one: labels with a wavy underline under the active
 * one, and no frame around the body.
 */
export type TabsVariant = "Tabs" | "Content";

export interface TabProps extends WidgetBaseProps {
  title: string;
  icon?: string;
  badge?: string;
  children?: React.ReactNode;
}

/**
 * One tab inside a `TabsLayout`. Mirrors `Ivy.Tab`.
 *
 * The element carries the tab's title, icon and badge; `TabsLayout` reads them
 * off and renders the strip itself, so a `Tab` only ever renders its own body.
 *
 * @tags tab page section
 * @example <Tab title="Overview" icon="House">Content</Tab>
 */
export const Tab = ({ children }: TabProps) => <>{children}</>;

export interface TabsLayoutProps extends WidgetBaseProps {
  /** Controlled selection. Leave undefined for uncontrolled. */
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  variant?: TabsVariant;
  /** Cancels the padding of whatever contains the layout. */
  removeParentPadding?: boolean;
  /** Padding around the tab body. */
  padding?: Sizing | Thickness;
  /** Shows a trailing add button with this label. */
  addButtonText?: string;
  /** `Tab` elements. Anything else is ignored. */
  children?: React.ReactNode;
  onSelect?: (index: number) => void;
  /** Given, every tab gets a close button. */
  onClose?: (index: number) => void;
  /** Given, the selected tab gets a refresh button. */
  onRefresh?: (index: number) => void;
  /** Given, tabs can be dragged into a new order. Receives the new arrangement. */
  onReorder?: (order: number[]) => void;
  onAddButtonClick?: () => void;
}

/**
 * Organizes content into separate views reached through a strip of tabs.
 * Mirrors `Ivy.TabsLayout`.
 *
 * @category Layouts
 * @ivy Ivy.TabsLayout
 * @tags tabs sections navigation
 * @slot children The `Tab` elements making up the strip
 * @example <TabsLayout><Tab title="Overview">…</Tab><Tab title="Settings">…</Tab></TabsLayout>
 * @example <TabsLayout variant="Tabs" onClose={close} onReorder={reorder}>{tabs}</TabsLayout>
 */
export const TabsLayout = ({
  id,
  selectedIndex,
  defaultSelectedIndex = 0,
  variant = "Content",
  removeParentPadding,
  padding = 4,
  addButtonText,
  children,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
  onClose,
  onRefresh,
  onReorder,
  onAddButtonClick,
}: TabsLayoutProps) => {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> => React.isValidElement(child),
  );

  const [internalIndex, setInternalIndex] = React.useState(defaultSelectedIndex);
  const [dragging, setDragging] = React.useState<number | null>(null);
  const active = Math.min(selectedIndex ?? internalIndex, Math.max(0, tabs.length - 1));

  const select = (index: number) => {
    if (selectedIndex === undefined) setInternalIndex(index);
    onSelect?.(index);
  };

  const drop = (target: number) => {
    if (dragging === null || dragging === target) return setDragging(null);
    const order = tabs.map((_, index) => index);
    order.splice(target, 0, ...order.splice(dragging, 1));
    setDragging(null);
    // The active tab follows the one it was on rather than staying put.
    const moved = order.indexOf(active);
    if (selectedIndex === undefined && moved !== -1) setInternalIndex(moved);
    onReorder?.(order);
  };

  const iconSize = densityIconSize(density);
  const tabPadding = byDensity(density, ["px-2 py-1", "px-3 py-1.5", "px-4 py-2"]);
  const boxed = variant === "Tabs";

  const strip = tabs.map((tab, index) => {
    const isActive = index === active;
    const label = (
      <>
        {tab.props.icon && <Icon name={tab.props.icon} size={iconSize} />}
        <span className="steady-bold min-w-0" data-label={tab.props.title}>
          <span className="truncate">{tab.props.title}</span>
        </span>
        {tab.props.badge && (
          <span className="rounded-full border border-current px-1.5 text-[10px]">
            {tab.props.badge}
          </span>
        )}
        {isActive && onRefresh && (
          <span
            role="button"
            aria-label={`Refresh ${tab.props.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onRefresh(index);
            }}
            className="cursor-pointer text-ink-muted hover:text-ink"
          >
            <Icon name="RefreshCw" size={iconSize - 2} />
          </span>
        )}
        {onClose && (
          <span
            role="button"
            aria-label={`Close ${tab.props.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose(index);
            }}
            className="cursor-pointer text-ink-muted hover:text-ink"
          >
            <Icon name="X" size={iconSize - 2} />
          </span>
        )}
      </>
    );

    const shared = {
      role: "tab" as const,
      "aria-selected": isActive,
      draggable: onReorder ? true : undefined,
      onDragStart: onReorder ? () => setDragging(index) : undefined,
      onDragOver: onReorder ? (event: React.DragEvent) => event.preventDefault() : undefined,
      onDrop: onReorder ? () => drop(index) : undefined,
      onDragEnd: onReorder ? () => setDragging(null) : undefined,
      onClick: () => select(index),
    };

    if (boxed) {
      return (
        <SketchFrame
          key={index}
          {...shared}
          as="button"
          type="button"
          seed={`${id}-tab-${index}`}
          corner="rounded"
          // The active tab keeps the paper it shares with the panel below;
          // the rest sit unfilled, a step back into the page.
          stroke={isActive ? INK : INK_FAINT}
          strokeWidth={isActive ? STROKE.emphasis : STROKE.thin}
          fill={isActive ? PAPER_RAISED : undefined}
          fillStyle="solid"
          doubleStroke={isActive}
          className={cn(
            "shrink-0 cursor-pointer",
            !isActive && "text-ink-muted hover:text-ink",
            dragging === index && "opacity-50",
          )}
          contentClassName={cn("flex items-center gap-2", tabPadding)}
        >
          {label}
        </SketchFrame>
      );
    }

    return (
      <button
        key={index}
        {...shared}
        type="button"
        className={cn(
          "flex shrink-0 cursor-pointer items-center gap-2",
          tabPadding,
          isActive ? "sketch-underline font-bold" : "text-ink-muted hover:text-ink",
          dragging === index && "opacity-50",
        )}
      >
        {label}
      </button>
    );
  });

  const body = (
    <div className="min-h-0 flex-1 overflow-auto" style={thicknessStyle(padding)}>
      {tabs[active]}
    </div>
  );

  return (
    <div
      id={id}
      className={cn(
        "flex min-h-0 flex-col",
        densityText(density),
        removeParentPadding && "remove-parent-padding",
        className,
      )}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <div
        role="tablist"
        className={cn(
          "flex shrink-0 items-end gap-1 overflow-x-auto",
          // Boxed tabs overlap the panel's top edge, so they read as sitting on
          // it rather than floating above it.
          boxed ? "-mb-px" : "border-b border-dashed border-ink-faint",
        )}
      >
        {strip}
        {addButtonText !== undefined && (
          <button
            type="button"
            onClick={onAddButtonClick}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1 text-ink-muted hover:text-ink",
              tabPadding,
            )}
          >
            <Icon name="Plus" size={iconSize} />
            {addButtonText}
          </button>
        )}
      </div>

      {boxed ? (
        <SketchFrame
          seed={`${id}-panel`}
          corner="rounded"
          stroke={INK_FAINT}
          fill={PAPER_RAISED}
          fillStyle="solid"
          className="flex min-h-0 flex-1 flex-col"
          contentClassName="flex min-h-0 flex-1 flex-col"
        >
          {body}
        </SketchFrame>
      ) : (
        body
      )}
    </div>
  );
};
