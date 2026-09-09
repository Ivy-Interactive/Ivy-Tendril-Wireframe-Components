import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, sizeStyle, widgetStyle } from "@/lib/utils";
import type { Align, MenuItem, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";
import { formatNumber, type FormatStyle } from "./inputs/NumberInput";
import { InputShell, nativeInputClass } from "./inputs/InputShell";
import { Badge } from "./Badge";
import { DropDownMenu } from "./Menus";
import { Pagination } from "./Navigation";

export type ColType =
  | "Text"
  | "Number"
  | "Boolean"
  | "Date"
  | "Badge"
  | "Link"
  | "Image"
  | "Custom";

export type SortDirection = "None" | "Ascending" | "Descending";

export interface DataTableColumn {
  name: string;
  header?: string;
  colType?: ColType;
  group?: string;
  width?: Sizing;
  hidden?: boolean;
  sortable?: boolean;
  sortDirection?: SortDirection;
  filterable?: boolean;
  alignContent?: Align;
  wrapText?: boolean;
  order?: number;
  icon?: string;
  help?: string;
  /** Aggregate strings rendered in the footer row. */
  footer?: string[];
  color?: string;
  badgeColorMapping?: Record<string, string>;
  formatStyle?: FormatStyle;
  precision?: number;
  currency?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface DataTableConfig {
  freezeColumns?: number;
  allowSorting?: boolean;
  allowFiltering?: boolean;
  pageSize?: number;
  selectionMode?: "None" | "Single" | "Multiple";
}

export interface DataTableProps extends WidgetBaseProps {
  columns?: DataTableColumn[];
  rows?: Array<Record<string, unknown>>;
  config?: DataTableConfig;
  rowActions?: MenuItem[];
  /** Per-row overrides for `rowActions`, keyed however your rows identify themselves. */
  perRowActions?: (row: Record<string, unknown>) => MenuItem[] | undefined;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  emptyView?: React.ReactNode;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
  onRowAction?: (row: Record<string, unknown>, action: MenuItem) => void;
  onSelectionChange?: (rows: Array<Record<string, unknown>>) => void;
}

const CELL_ALIGN: Partial<Record<Align, string>> = {
  Left: "text-left",
  Right: "text-right",
  Center: "text-center",
};

function renderCell(column: DataTableColumn, row: Record<string, unknown>): React.ReactNode {
  const value = row[column.name];
  if (column.render) return column.render(value, row);
  if (value === null || value === undefined) return <span className="text-ink-faint">—</span>;

  switch (column.colType) {
    case "Number":
      return (
        <span className="tabular-nums">
          {formatNumber(Number(value), column.formatStyle, column.precision, column.currency)}
        </span>
      );
    case "Boolean":
      return <Icon name={value ? "Check" : "X"} size={14} color={value ? "Success" : "Muted"} />;
    case "Date":
      return new Date(String(value)).toLocaleDateString();
    case "Badge":
      return (
        <Badge
          title={String(value)}
          density="Small"
          color={column.badgeColorMapping?.[String(value)] ?? column.color}
        />
      );
    case "Link":
      return (
        <a href={String(value)} className="text-accent sketch-underline">
          {String(value)}
        </a>
      );
    case "Image":
      return <img src={String(value)} alt="" className="h-6 w-6 object-cover [filter:url(#tendril-wobble)]" />;
    default:
      return String(value);
  }
}

/**
 * A sortable, filterable, paginated grid. Mirrors `Ivy.DataTable`; where the
 * Ivy widget streams from a `DataTableConnection`, this one takes `rows`
 * directly, which is what a wireframe needs.
 *
 * @tags grid sortable filterable paginated
 * @example <DataTable columns={[{ name: "name", header: "Name" }]} rows={people} />
 */
export const DataTable = ({
  id,
  columns = [],
  rows = [],
  config,
  rowActions,
  perRowActions,
  density = "Medium",
  width = "100%",
  height,
  aspectRatio,
  visible,
  headerLeft,
  headerRight,
  emptyView,
  className,
  style,
  onRowClick,
  onRowAction,
  onSelectionChange,
}: DataTableProps) => {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ column: string; direction: SortDirection } | null>(() => {
    const preset = columns.find((column) => column.sortDirection && column.sortDirection !== "None");
    return preset ? { column: preset.name, direction: preset.sortDirection! } : null;
  });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const visibleColumns = React.useMemo(
    () => columns.filter((column) => !column.hidden).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [columns],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return rows;
    const needle = query.toLowerCase();
    return rows.filter((row) =>
      visibleColumns.some((column) => String(row[column.name] ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, query, visibleColumns]);

  const sorted = React.useMemo(() => {
    if (!sort || sort.direction === "None") return filtered;
    const factor = sort.direction === "Ascending" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = a[sort.column];
      const right = b[sort.column];
      if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
      return String(left ?? "").localeCompare(String(right ?? "")) * factor;
    });
  }, [filtered, sort]);

  const pageSize = config?.pageSize ?? 0;
  const numPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const paged = pageSize ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  const selectionMode = config?.selectionMode ?? "None";
  const selectable = selectionMode !== "None";

  const toggleRow = (index: number) => {
    const next = new Set(selectionMode === "Single" ? [] : selected);
    if (selected.has(index)) next.delete(index);
    else next.add(index);
    setSelected(next);
    onSelectionChange?.([...next].map((position) => sorted[position]).filter(Boolean));
  };

  const cycleSort = (column: DataTableColumn) => {
    if (config?.allowSorting === false || column.sortable === false) return;
    setSort((current) => {
      if (current?.column !== column.name) return { column: column.name, direction: "Ascending" };
      if (current.direction === "Ascending") return { column: column.name, direction: "Descending" };
      return null;
    });
  };

  const cellPadding = byDensity(density, ["px-2 py-1", "px-3 py-2", "px-4 py-3"]);
  const hasFooter = visibleColumns.some((column) => column.footer?.length);

  return (
    <SketchFrame
      id={id}
      seed={id ?? "datatable"}
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("block", densityText(density), className)}
      contentClassName="flex h-full flex-col overflow-hidden"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {(headerLeft || headerRight || config?.allowFiltering !== false) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink-faint px-3 py-2">
          {headerLeft}
          {config?.allowFiltering !== false && (
            <InputShell
              density="Small"
              width="14rem"
              prefix={<Icon name="Search" size={densityIconSize("Small")} />}
              showClear={Boolean(query)}
              onClear={() => setQuery("")}
            >
              <input
                value={query}
                placeholder="Filter rows…"
                aria-label="Filter rows"
                className={nativeInputClass}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </InputShell>
          )}
          <span className="ml-auto flex items-center gap-2">
            <span className="text-xs text-ink-muted">
              {sorted.length} row{sorted.length === 1 ? "" : "s"}
            </span>
            {headerRight}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-[2] bg-paper-sunken">
            <tr className="border-b border-dashed border-ink-faint">
              {selectable && <th className={cn("w-8", cellPadding)} />}
              {visibleColumns.map((column) => {
                const active = sort?.column === column.name;
                return (
                  <th
                    key={column.name}
                    scope="col"
                    style={sizeStyle(column.width)}
                    className={cn(cellPadding, CELL_ALIGN[column.alignContent ?? "Left"], "font-bold")}
                  >
                    <button
                      type="button"
                      onClick={() => cycleSort(column)}
                      title={column.help}
                      className={cn(
                        "inline-flex items-center gap-1",
                        column.sortable !== false && config?.allowSorting !== false
                          ? "cursor-pointer"
                          : "cursor-default",
                      )}
                    >
                      {column.icon && <Icon name={column.icon} size={13} />}
                      {column.header ?? column.name}
                      {active && (
                        <Icon
                          name={sort!.direction === "Ascending" ? "ArrowUp" : "ArrowDown"}
                          size={12}
                        />
                      )}
                    </button>
                  </th>
                );
              })}
              {rowActions?.length ? <th className={cn("w-10", cellPadding)} /> : null}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                  {emptyView ?? (
                    <span className="block py-6 text-center text-ink-muted">
                      Nothing matches this filter
                    </span>
                  )}
                </td>
              </tr>
            )}
            {paged.map((row, index) => {
              const absoluteIndex = pageSize ? (page - 1) * pageSize + index : index;
              return (
                <tr
                  key={absoluteIndex}
                  onClick={() => onRowClick?.(row, absoluteIndex)}
                  className={cn(
                    "border-b border-dashed border-ink-faint last:border-b-0",
                    selected.has(absoluteIndex) && "bg-highlight",
                    onRowClick && "cursor-pointer hover:bg-highlight",
                  )}
                >
                  {selectable && (
                    <td className={cellPadding}>
                      <button
                        type="button"
                        aria-label="Select row"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleRow(absoluteIndex);
                        }}
                        className="cursor-pointer"
                      >
                        <Icon
                          name={selected.has(absoluteIndex) ? "SquareCheck" : "Square"}
                          size={14}
                        />
                      </button>
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.name}
                      className={cn(
                        cellPadding,
                        CELL_ALIGN[column.alignContent ?? "Left"],
                        !column.wrapText && "truncate whitespace-nowrap",
                      )}
                      style={{ color: column.color ? resolveColor(column.color) : undefined }}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                  {rowActions?.length ? (
                    <td className={cellPadding}>
                      <DropDownMenu
                        items={perRowActions?.(row) ?? rowActions}
                        density={density}
                        align="End"
                        onSelect={(action) => onRowAction?.(row, action)}
                        trigger={
                          <button
                            type="button"
                            aria-label="Row actions"
                            onClick={(event) => event.stopPropagation()}
                            className="cursor-pointer text-ink-muted hover:text-ink"
                          >
                            <Icon name="Ellipsis" size={16} />
                          </button>
                        }
                      />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
          {hasFooter && (
            <tfoot>
              <tr className="border-t-2 border-ink-faint font-bold">
                {selectable && <td className={cellPadding} />}
                {visibleColumns.map((column) => (
                  <td
                    key={column.name}
                    className={cn(cellPadding, CELL_ALIGN[column.alignContent ?? "Left"])}
                  >
                    {column.footer?.join(" · ")}
                  </td>
                ))}
                {rowActions?.length ? <td className={cellPadding} /> : null}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {pageSize > 0 && numPages > 1 && (
        <div className="flex justify-end border-t border-dashed border-ink-faint px-3 py-2">
          <Pagination page={page} numPages={numPages} density="Small" onChange={setPage} />
        </div>
      )}
    </SketchFrame>
  );
};
