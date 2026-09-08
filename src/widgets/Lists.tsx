import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, widgetStyle } from "@/lib/utils";
import type { Densities, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { Badge } from "./Badge";

const ListDensityContext = React.createContext<Densities>("Medium");

export interface ListProps extends WidgetBaseProps {
  children?: React.ReactNode;
}

/**
 * A bordered stack of `ListItem`s. Mirrors `Ivy.List`.
 *
 * @tags collection rows
 * @example <List><ListItem title="Inbox" badge="12" /></List>
 */
export const List = ({
  id,
  children,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: ListProps) => (
  <ListDensityContext.Provider value={density}>
    <SketchFrame
      id={id}
      seed={id ?? "list"}
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("block", className)}
      contentClassName="block overflow-hidden"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <ul className="m-0 list-none p-0">{children}</ul>
    </SketchFrame>
  </ListDensityContext.Provider>
);

export interface ListItemProps extends WidgetBaseProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * One row of a list. Mirrors `Ivy.ListItem`.
 *
 * @tags row entry
 * @example <ListItem title="Inbox" subtitle="12 unread" icon="Inbox" onClick={open} />
 */
export const ListItem = ({
  id,
  title,
  subtitle,
  icon,
  badge,
  disabled,
  children,
  density,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onClick,
}: ListItemProps) => {
  const contextDensity = React.useContext(ListDensityContext);
  const resolved = density ?? contextDensity;
  const Row = onClick ? "button" : "div";

  return (
    <li
      id={id}
      className={cn("border-b border-dashed border-ink-faint last:border-b-0", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <Row
        type={onClick ? "button" : undefined}
        onClick={disabled ? undefined : onClick}
        disabled={onClick ? disabled : undefined}
        className={cn(
          "flex w-full items-center gap-3 text-left",
          byDensity(resolved, ["px-2.5 py-1.5", "px-3.5 py-2.5", "px-4 py-3.5"]),
          densityText(resolved),
          disabled ? "cursor-not-allowed opacity-45" : onClick && "cursor-pointer hover:bg-highlight",
        )}
      >
        {icon && <Icon name={icon} size={densityIconSize(resolved) + 2} />}
        <span className="block min-w-0 flex-1">
          {title && <span className="block truncate font-bold">{title}</span>}
          {subtitle && <span className="block truncate text-ink-muted">{subtitle}</span>}
          {children}
        </span>
        {badge && <Badge title={badge} variant="Secondary" density="Small" />}
      </Row>
    </li>
  );
};

export interface DetailsProps extends WidgetBaseProps {
  children?: React.ReactNode;
  /** Number of label/value columns. */
  columns?: number;
}

/**
 * Label/value read-out grid. Mirrors `Ivy.Details`.
 *
 * @tags key-value summary
 * @example <Details><Detail label="Owner">Ada</Detail></Details>
 */
export const Details = ({
  id,
  children,
  density = "Medium",
  columns = 1,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: DetailsProps) => (
  <ListDensityContext.Provider value={density}>
    <dl
      id={id}
      className={cn("m-0 grid gap-x-6", densityText(density), className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        ...widgetStyle({ width, height, aspectRatio, visible, style }),
      }}
    >
      {children}
    </dl>
  </ListDensityContext.Provider>
);

export interface DetailProps extends WidgetBaseProps {
  label: string;
  multiline?: boolean;
  children?: React.ReactNode;
}

/**
 * One label/value pair. Mirrors `Ivy.Detail`.
 *
 * @tags key-value row
 * @example <Detail label="Status">Active</Detail>
 */
export const Detail = ({
  id,
  label,
  multiline,
  children,
  width,
  height,
  aspectRatio,
  visible,
  density: ownDensity,
  className,
  style,
}: DetailProps) => {
  const density = ownDensity ?? React.useContext(ListDensityContext);
  return (
    <div
      id={id}
      className={cn(
        "flex items-baseline justify-between gap-4 border-b border-dashed border-ink-faint",
        byDensity(density, ["py-1", "py-1.5", "py-2.5"]),
        className,
      )}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className={cn("m-0 text-right font-bold", !multiline && "truncate")}>{children}</dd>
    </div>
  );
};
