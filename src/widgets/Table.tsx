import * as React from "react";
import { byDensity, cn, densityText, widgetStyle } from "@/lib/utils";
import type { Align, Densities, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED } from "@/sketch/colors";
import { SketchFrame } from "@/sketch/SketchFrame";

const TableDensityContext = React.createContext<Densities>("Medium");

export interface TableProps extends WidgetBaseProps {
  children?: React.ReactNode;
  layout?: "Auto" | "Fixed";
}

/**
 * Grid of rows and cells. Mirrors `Ivy.Table`.
 *
 * @tags grid rows static
 * @example <Table><tbody><TableRow><TableCell>Pencils</TableCell></TableRow></tbody></Table>
 */
export const Table = ({
  id,
  children,
  width = "100%",
  height,
  aspectRatio,
  visible,
  density = "Medium",
  layout = "Auto",
  className,
  style,
}: TableProps) => (
  <TableDensityContext.Provider value={density}>
    <SketchFrame
      id={id}
      seed={id ?? "table"}
      corner="rounded"
      stroke={INK_FAINT}
      fill={PAPER_RAISED}
      fillStyle="solid"
      className={cn("block overflow-hidden", className)}
      contentClassName="block overflow-x-auto"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <table
        className={cn("w-full border-collapse text-left", densityText(density))}
        style={{ tableLayout: layout === "Fixed" ? "fixed" : "auto" }}
      >
        {children}
      </table>
    </SketchFrame>
  </TableDensityContext.Provider>
);

export interface TableRowProps extends WidgetBaseProps {
  isHeader?: boolean;
  isFooter?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
}

/** One row. Mirrors `Ivy.TableRow`. */
export const TableRow = ({
  id,
  isHeader,
  isFooter,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onClick,
}: TableRowProps) => (
  <tr
    id={id}
    onClick={onClick}
    className={cn(
      "border-b border-dashed border-ink-faint last:border-b-0",
      isHeader && "bg-paper-sunken font-bold",
      isFooter && "border-t-2 border-solid border-ink-faint font-bold",
      onClick && "cursor-pointer hover:bg-highlight",
      className,
    )}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    {children}
  </tr>
);

export interface TableCellProps extends WidgetBaseProps {
  isHeader?: boolean;
  isFooter?: boolean;
  alignContent?: Align;
  multiline?: boolean;
  colSpan?: number;
  rowSpan?: number;
  children?: React.ReactNode;
}

const CELL_ALIGN: Partial<Record<Align, string>> = {
  Left: "text-left",
  Right: "text-right",
  Center: "text-center",
  TopLeft: "text-left align-top",
  TopCenter: "text-center align-top",
  TopRight: "text-right align-top",
  BottomLeft: "text-left align-bottom",
  BottomCenter: "text-center align-bottom",
  BottomRight: "text-right align-bottom",
};

/** One cell. Mirrors `Ivy.TableCell`. */
export const TableCell = ({
  id,
  isHeader,
  isFooter,
  alignContent = "Left",
  width,
  height,
  aspectRatio,
  visible,
  multiline,
  density = "Medium",
  colSpan,
  rowSpan,
  children,
  className,
  style,
}: TableCellProps) => {
  const contextDensity = React.useContext(TableDensityContext);
  const Cell = isHeader ? "th" : "td";

  return (
    <Cell
      id={id}
      colSpan={colSpan}
      rowSpan={rowSpan}
      scope={isHeader ? "col" : undefined}
      className={cn(
        byDensity(density ?? contextDensity, ["px-2 py-1", "px-3 py-2", "px-4 py-3"]),
        CELL_ALIGN[alignContent] ?? "text-left",
        !multiline && "truncate whitespace-nowrap",
        isFooter && "font-bold",
        className,
      )}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {children}
    </Cell>
  );
};
