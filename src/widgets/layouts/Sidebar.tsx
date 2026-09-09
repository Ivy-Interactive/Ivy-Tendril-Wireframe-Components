import * as React from "react";
import {
  byDensity,
  cn,
  densityIconSize,
  densityText,
  scrollClass,
  toCssSize,
  widgetStyle,
} from "@/lib/utils";
import type { MenuItem, Scroll, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, STROKE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;

export interface SidebarLayoutProps extends WidgetBaseProps {
  /** The main content area, filling whatever the sidebar leaves. */
  mainContent?: React.ReactNode;
  /** The body of the sidebar — usually a `SidebarMenu`. */
  sidebarContent?: React.ReactNode;
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  /** Stands in for the header once the sidebar is collapsed. */
  sidebarHeaderCollapsed?: React.ReactNode;
  /** Stands in for the footer once the sidebar is collapsed. */
  sidebarFooterCollapsed?: React.ReactNode;
  /** Controlled open state. Leave undefined for uncontrolled. */
  open?: boolean;
  defaultOpen?: boolean;
  /** Marks this as the application's own sidebar rather than a nested one. */
  mainAppSidebar?: boolean;
  mainContentPadding?: Sizing;
  /** Lets the divider be dragged to resize the sidebar, between 200px and 600px. */
  resizable?: boolean;
  sidebarContentScroll?: Scroll;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The application shell: a collapsible sidebar beside a main content area.
 * Mirrors `Ivy.SidebarLayout`.
 *
 * @category Layouts
 * @ivy Ivy.SidebarLayout
 * @tags shell navigation app frame
 * @slot mainContent The main content area
 * @slot sidebarContent The body of the sidebar
 * @slot sidebarHeader Rendered above the sidebar content
 * @slot sidebarFooter Rendered below the sidebar content
 * @slot sidebarHeaderCollapsed Stands in for the header when collapsed
 * @slot sidebarFooterCollapsed Stands in for the footer when collapsed
 * @example <SidebarLayout mainContent={<Page />} sidebarContent={<SidebarMenu items={items} />} />
 */
export const SidebarLayout = ({
  id,
  mainContent,
  sidebarContent,
  sidebarHeader,
  sidebarFooter,
  sidebarHeaderCollapsed,
  sidebarFooterCollapsed,
  open,
  defaultOpen = true,
  mainAppSidebar,
  mainContentPadding = 8,
  resizable,
  sidebarContentScroll = "Auto",
  density = "Medium",
  width = "16rem",
  height = "100%",
  aspectRatio,
  visible,
  className,
  style,
  onOpenChange,
}: SidebarLayoutProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  // The dragged width only exists once someone has dragged; until then the
  // `width` prop is in charge, so a controlled width keeps working.
  const [draggedWidth, setDraggedWidth] = React.useState<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { ref: dividerRef, height: dividerHeight } = useMeasuredSize<HTMLDivElement>();

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizable || !isOpen) return;
    const left = rootRef.current?.getBoundingClientRect().left ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);

    const move = (moveEvent: PointerEvent) => {
      setDraggedWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, moveEvent.clientX - left)));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const sidebarWidth = isOpen ? (draggedWidth ? `${draggedWidth}px` : toCssSize(width)) : "3.25rem";

  return (
    <div
      id={id}
      ref={rootRef}
      className={cn("flex min-h-0 items-stretch", densityText(density), className)}
      style={widgetStyle({ width: "100%", height, aspectRatio, visible, style })}
    >
      <aside
        className={cn(
          "flex min-h-0 shrink-0 flex-col transition-[width] duration-150",
          mainAppSidebar && "bg-paper-sunken",
        )}
        style={{ width: sidebarWidth }}
      >
        <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1 truncate">
            {isOpen ? sidebarHeader : (sidebarHeaderCollapsed ?? null)}
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="shrink-0 cursor-pointer text-ink-muted hover:text-ink"
          >
            <Icon name={isOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={densityIconSize(density)} />
          </button>
        </div>

        <div className={cn("min-h-0 flex-1 px-2", scrollClass(sidebarContentScroll))}>
          {isOpen && sidebarContent}
        </div>

        {(sidebarFooter || sidebarFooterCollapsed) && (
          <div className="shrink-0 px-3 py-2.5">
            {isOpen ? sidebarFooter : (sidebarFooterCollapsed ?? null)}
          </div>
        )}
      </aside>

      {/* The divider is a drawn pencil line rather than a border, so the seam
          between sidebar and content is in the same hand as everything else. */}
      <div
        ref={dividerRef}
        onPointerDown={startResize}
        className={cn(
          "relative w-px shrink-0 self-stretch",
          resizable && isOpen && "w-1.5 cursor-col-resize",
        )}
      >
        {dividerHeight > 0 && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <RoughShape
              shape={{ kind: "line", x1: 1, y1: 0, x2: 1, y2: dividerHeight }}
              seed={`${id}-divider`}
              stroke={INK_FAINT}
              strokeWidth={STROKE.thin}
            />
          </svg>
        )}
      </div>

      <main className="min-w-0 flex-1 overflow-auto" style={{ padding: toCssSize(mainContentPadding) }}>
        {mainContent}
      </main>
    </div>
  );
};

export interface SidebarMenuProps extends WidgetBaseProps {
  items?: MenuItem[];
  /** Shows a filter box above the menu. */
  searchActive?: boolean;
  /** The path of the item drawn as current. */
  selected?: string;
  onSelect?: (item: MenuItem) => void;
}

/** Renders one item and, when it has children, the group nested under it. */
const SidebarMenuRow = ({
  item,
  depth,
  selected,
  density,
  onSelect,
}: {
  item: MenuItem;
  depth: number;
  selected?: string;
  density?: SidebarMenuProps["density"];
  onSelect?: (item: MenuItem) => void;
}) => {
  const [expanded, setExpanded] = React.useState(item.expanded ?? true);
  const iconSize = densityIconSize(density);
  const hasChildren = Boolean(item.children?.length);
  const isSelected = selected !== undefined && item.path === selected;

  if (item.variant === "Separator") {
    return <div className="my-1.5 border-t border-dashed border-ink-faint" />;
  }

  return (
    <>
      <button
        type="button"
        title={item.tooltip}
        disabled={item.disabled}
        aria-current={isSelected ? "page" : undefined}
        onClick={() => {
          if (hasChildren) setExpanded((value) => !value);
          onSelect?.(item);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-sm text-left",
          byDensity(density, ["px-2 py-1", "px-2.5 py-1.5", "px-3 py-2"]),
          isSelected ? "bg-highlight font-bold" : "hover:bg-highlight",
          item.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
        )}
        style={{ paddingLeft: `${0.625 + depth * 0.75}rem` }}
      >
        {hasChildren && (
          <Icon
            name="ChevronRight"
            size={iconSize - 2}
            className={cn("transition-transform duration-150", expanded && "rotate-90")}
          />
        )}
        {item.icon && <Icon name={item.icon} size={iconSize} />}
        <span className="steady-bold min-w-0 flex-1" data-label={item.label}>
          <span className="truncate">{item.label}</span>
        </span>
        {item.badge && (
          <span className="rounded-full border border-current px-1.5 text-[10px]">{item.badge}</span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child, index) => (
            <SidebarMenuRow
              key={`${child.label}-${index}`}
              item={child}
              depth={depth + 1}
              selected={selected}
              density={density}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
};

/**
 * The navigation menu that usually fills a `SidebarLayout`'s sidebar.
 * Mirrors `Ivy.SidebarMenu`.
 *
 * @category Layouts
 * @ivy Ivy.SidebarMenu
 * @tags navigation menu sidebar
 * @example <SidebarMenu items={items} searchActive onSelect={go} />
 */
export const SidebarMenu = ({
  id,
  items = [],
  searchActive,
  selected,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
}: SidebarMenuProps) => {
  const [query, setQuery] = React.useState("");

  // Filtering keeps a group whose own label matches, and otherwise keeps only
  // the children that match — so a search never hides the branch it found.
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    const match = (item: MenuItem): MenuItem | null => {
      if (item.label.toLowerCase().includes(needle)) return item;
      const children = item.children?.map(match).filter((child): child is MenuItem => child !== null);
      return children?.length ? { ...item, children, expanded: true } : null;
    };
    return items.map(match).filter((item): item is MenuItem => item !== null);
  }, [items, query]);

  return (
    <nav
      id={id}
      aria-label="Sidebar"
      className={cn(densityText(density), className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {searchActive && (
        <SketchFrame
          seed={`${id}-search`}
          corner="rounded"
          stroke={INK_FAINT}
          fill={PAPER_RAISED}
          fillStyle="solid"
          strokeWidth={STROKE.thin}
          className="mb-2 block"
          contentClassName="flex items-center gap-2 px-2.5 py-1.5"
        >
          <Icon name="Search" size={densityIconSize(density) - 2} color={INK_FAINT} />
          <input
            type="search"
            value={query}
            placeholder="Search"
            aria-label="Search menu"
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
          />
        </SketchFrame>
      )}
      {filtered.map((item, index) => (
        <SidebarMenuRow
          key={`${item.label}-${index}`}
          item={item}
          depth={0}
          selected={selected}
          density={density}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
};
