import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, INK_MUTED, STROKE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  hasOnClick?: boolean;
}

export interface BreadcrumbsProps extends WidgetBaseProps {
  items?: BreadcrumbItem[];
  /** Character drawn between crumbs. Defaults to a chevron. */
  separator?: string;
  disabled?: boolean;
  onSelect?: (item: BreadcrumbItem, index: number) => void;
}

/**
 * Trail of parent pages. Mirrors `Ivy.Breadcrumbs`.
 *
 * @tags navigation trail path
 * @example <Breadcrumbs items={[{ label: "Home", icon: "House" }, { label: "Projects" }]} />
 */
export const Breadcrumbs = ({
  id,
  items = [],
  separator,
  disabled,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSelect,
}: BreadcrumbsProps) => (
  <nav
    id={id}
    aria-label="Breadcrumb"
    className={cn(densityText(density), className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <ol className="flex list-none flex-wrap items-center gap-1.5 p-0">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        const clickable = !last && !disabled && !item.disabled;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <button
              type="button"
              title={item.tooltip}
              disabled={!clickable}
              onClick={() => onSelect?.(item, index)}
              aria-current={last ? "page" : undefined}
              className={cn(
                "flex items-center gap-1",
                last ? "font-bold text-ink" : "text-ink-muted",
                clickable && "cursor-pointer hover:sketch-underline hover:text-ink",
                (disabled || item.disabled) && "cursor-not-allowed opacity-50",
              )}
            >
              {item.icon && <Icon name={item.icon} size={densityIconSize(density)} />}
              {item.label}
            </button>
            {!last &&
              (separator ? (
                <span className="text-ink-faint">{separator}</span>
              ) : (
                <Icon name="ChevronRight" size={densityIconSize(density)} color={INK_FAINT} />
              ))}
          </li>
        );
      })}
    </ol>
  </nav>
);

export interface PaginationProps extends WidgetBaseProps {
  page?: number;
  numPages: number;
  /** Pages kept either side of the current one. */
  siblings?: number;
  /** Pages always kept at each end. */
  boundaries?: number;
  disabled?: boolean;
  onChange?: (page: number) => void;
}

function pageRange(page: number, numPages: number, siblings: number, boundaries: number) {
  const pages = new Set<number>();
  for (let i = 1; i <= Math.min(boundaries, numPages); i++) pages.add(i);
  for (let i = Math.max(1, numPages - boundaries + 1); i <= numPages; i++) pages.add(i);
  for (let i = Math.max(1, page - siblings); i <= Math.min(numPages, page + siblings); i++) {
    pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "gap"> = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("gap");
    result.push(value);
  });
  return result;
}

/**
 * Numbered page switcher. Mirrors `Ivy.Pagination`.
 *
 * @tags paging navigation
 * @example <Pagination page={page} numPages={12} onChange={setPage} />
 */
export const Pagination = ({
  id,
  page = 1,
  numPages,
  siblings = 1,
  boundaries = 1,
  disabled,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
}: PaginationProps) => {
  const items = pageRange(page, Math.max(1, numPages), siblings, boundaries);
  const size = byDensity(density, ["h-7 min-w-7", "h-9 min-w-9", "h-11 min-w-11"]);

  const go = (target: number) => {
    if (disabled) return;
    const next = Math.min(Math.max(1, target), numPages);
    if (next !== page) onChange?.(next);
  };

  const arrow = (direction: "prev" | "next") => {
    const isPrev = direction === "prev";
    const inactive = disabled || (isPrev ? page <= 1 : page >= numPages);
    return (
      <SketchFrame
        as="button"
        type="button"
        seed={`${id}-${direction}`}
        corner="rounded"
        stroke={inactive ? INK_FAINT : INK_MUTED}
        strokeWidth={STROKE.thin}
        disabled={inactive}
        aria-label={isPrev ? "Previous page" : "Next page"}
        onClick={() => go(isPrev ? page - 1 : page + 1)}
        className={cn(size, inactive ? "cursor-not-allowed opacity-45" : "cursor-pointer")}
        contentClassName="flex h-full w-full items-center justify-center px-2"
      >
        <Icon name={isPrev ? "ChevronLeft" : "ChevronRight"} size={densityIconSize(density)} />
      </SketchFrame>
    );
  };

  return (
    <nav
      id={id}
      aria-label="Pagination"
      className={cn("flex items-center gap-1.5", densityText(density), className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {arrow("prev")}
      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-faint">
            &#8230;
          </span>
        ) : (
          <SketchFrame
            key={item}
            as="button"
            type="button"
            seed={`${id}-page-${item}`}
            corner="rounded"
            stroke={item === page ? INK : INK_FAINT}
            strokeWidth={item === page ? 1.5 : 1}
            doubleStroke={item === page}
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
            onClick={() => go(item)}
            className={cn(
              size,
              item === page ? "font-bold" : "text-ink-muted",
              disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
            )}
            contentClassName="flex h-full w-full items-center justify-center px-2"
          >
            {item}
          </SketchFrame>
        ),
      )}
      {arrow("next")}
    </nav>
  );
};

export interface ExpandableProps extends WidgetBaseProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  /** Controlled open state. Leave undefined for uncontrolled. */
  open?: boolean;
  defaultOpen?: boolean;
  icon?: string;
  ghost?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A disclosure panel. Mirrors `Ivy.Expandable`.
 *
 * @tags disclosure accordion collapse
 * @example <Expandable header="Advanced">Hidden until opened.</Expandable>
 */
export const Expandable = ({
  id,
  header,
  children,
  disabled,
  open,
  defaultOpen = false,
  density = "Medium",
  icon,
  ghost,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onOpenChange,
}: ExpandableProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  const toggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const pad = byDensity(density, ["px-2 py-1.5", "px-3 py-2", "px-4 py-3"]);

  return (
    <SketchFrame
      id={id}
      seed={id ?? "expandable"}
      outline={ghost ? "none" : "solid"}
      stroke={INK_FAINT}
      className={cn("block w-full", densityText(density), className)}
      contentClassName="block"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          "flex w-full items-center gap-2 text-left font-bold",
          pad,
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <Icon
          name={icon ?? "ChevronRight"}
          size={densityIconSize(density)}
          className={cn("transition-transform duration-150", isOpen && "rotate-90")}
        />
        <span className="min-w-0 flex-1">{header}</span>
      </button>
      {isOpen && (
        <div className={cn("border-t border-dashed border-ink-faint", pad)}>{children}</div>
      )}
    </SketchFrame>
  );
};
