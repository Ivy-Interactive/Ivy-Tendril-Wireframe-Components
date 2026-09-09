import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { Orientation, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, INK_MUTED, STROKE } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

/** Smallest share of the group a panel can be dragged down to. */
const MIN_SHARE = 5;

export interface ResizablePanelProps extends WidgetBaseProps {
  /**
   * Share of the group this panel starts at, as a percentage or a `"1/3"`
   * fraction. Panels without one split whatever is left evenly.
   */
  defaultSize?: Sizing;
  children?: React.ReactNode;
}

/**
 * One panel inside a `ResizablePanelGroup`. Mirrors `Ivy.ResizablePanel`.
 *
 * The group reads `defaultSize` off the element and owns the sizing from then
 * on, so a panel only ever renders its own content.
 *
 * @category Layouts
 * @ivy Ivy.ResizablePanel
 * @tags panel split pane
 * @example <ResizablePanel defaultSize={30}>Navigator</ResizablePanel>
 */
export const ResizablePanel = ({ children, className, style }: ResizablePanelProps) => (
  <div className={cn("h-full w-full overflow-auto", className)} style={style}>
    {children}
  </div>
);

/** Reads a `defaultSize` — 30, "30%" or "1/3" — as a percentage of the group. */
function toShare(size: Sizing | undefined): number | null {
  if (size === undefined || size === null || size === "") return null;
  if (typeof size === "number") return size <= 1 ? size * 100 : size;
  const fraction = /^(\d+)\/(\d+)$/.exec(size);
  if (fraction) return (Number(fraction[1]) / Number(fraction[2])) * 100;
  const value = parseFloat(size);
  return Number.isNaN(value) ? null : value <= 1 ? value * 100 : value;
}

export interface ResizablePanelGroupProps extends WidgetBaseProps {
  direction?: Orientation;
  /** Draws the grab handle on each divider. */
  showHandle?: boolean;
  /** `ResizablePanel` elements. Anything else is ignored. */
  children?: React.ReactNode;
  /** Fires with the new percentage split once a drag settles. */
  onResize?: (sizes: number[]) => void;
}

/**
 * Panels that can be dragged to resize against each other.
 * Mirrors `Ivy.ResizablePanelGroup`.
 *
 * @category Layouts
 * @ivy Ivy.ResizablePanelGroup
 * @tags split pane resize columns
 * @slot children The `ResizablePanel` elements to lay out
 * @example <ResizablePanelGroup><ResizablePanel defaultSize={30}>Tree</ResizablePanel><ResizablePanel>Editor</ResizablePanel></ResizablePanelGroup>
 */
export const ResizablePanelGroup = ({
  id,
  direction = "Horizontal",
  showHandle = true,
  children,
  width = "100%",
  height = "100%",
  aspectRatio,
  visible,
  className,
  style,
  onResize,
}: ResizablePanelGroupProps) => {
  const panels = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<ResizablePanelProps> => React.isValidElement(child),
  );

  const horizontal = direction === "Horizontal";
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Whatever the panels asked for, spread over 100%: named shares are honoured
  // and the rest split what is left, so the group always adds up.
  const initial = React.useMemo(() => {
    const asked = panels.map((panel) => toShare(panel.props.defaultSize));
    const claimed = asked.reduce<number>((total, share) => total + (share ?? 0), 0);
    const unnamed = asked.filter((share) => share === null).length;
    const each = unnamed > 0 ? Math.max(0, 100 - claimed) / unnamed : 0;
    return asked.map((share) => share ?? each);
  }, [panels.length, panels.map((panel) => panel.props.defaultSize).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const [sizes, setSizes] = React.useState(initial);
  React.useEffect(() => setSizes(initial), [initial]);

  const startDrag = (divider: number) => (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    event.preventDefault();

    const box = container.getBoundingClientRect();
    const total = horizontal ? box.width : box.height;
    if (total <= 0) return;

    const origin = horizontal ? event.clientX : event.clientY;
    const before = sizes[divider];
    const after = sizes[divider + 1];
    let latest = sizes;

    const move = (moveEvent: PointerEvent) => {
      const delta = ((horizontal ? moveEvent.clientX : moveEvent.clientY) - origin) / total * 100;
      // The drag moves the seam: whatever one side gains, its neighbour gives
      // up, so the panels either side of it stay put.
      const clamped = Math.max(MIN_SHARE - before, Math.min(after - MIN_SHARE, delta));
      latest = sizes.map((size, index) =>
        index === divider ? before + clamped : index === divider + 1 ? after - clamped : size,
      );
      setSizes(latest);
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      onResize?.(latest);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  return (
    <div
      id={id}
      ref={containerRef}
      className={cn("flex min-h-0 min-w-0", horizontal ? "flex-row" : "flex-col", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {panels.map((panel, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ResizableDivider
              id={`${id}-divider-${index}`}
              horizontal={horizontal}
              showHandle={showHandle}
              onPointerDown={startDrag(index - 1)}
            />
          )}
          <div className="min-h-0 min-w-0 overflow-hidden" style={{ flexBasis: `${sizes[index] ?? 0}%` }}>
            {panel}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

/** The seam between two panels: a drawn line, plus a grip to take hold of. */
const ResizableDivider = ({
  id,
  horizontal,
  showHandle,
  onPointerDown,
}: {
  id: string;
  horizontal: boolean;
  showHandle: boolean;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
}) => {
  const { ref, width, height } = useMeasuredSize<HTMLDivElement>();

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      className={cn(
        "group relative shrink-0 touch-none",
        horizontal ? "w-1.5 cursor-col-resize" : "h-1.5 cursor-row-resize",
      )}
    >
      {width > 0 && height > 0 && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <RoughShape
            shape={
              horizontal
                ? { kind: "line", x1: width / 2, y1: 0, x2: width / 2, y2: height }
                : { kind: "line", x1: 0, y1: height / 2, x2: width, y2: height / 2 }
            }
            seed={id}
            stroke={INK_FAINT}
            strokeWidth={STROKE.thin}
          />
        </svg>
      )}
      {showHandle && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute rounded-full bg-ink-faint transition-colors group-hover:bg-ink-muted",
            horizontal
              ? "top-1/2 left-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2"
              : "top-1/2 left-1/2 h-1 w-6 -translate-x-1/2 -translate-y-1/2",
          )}
          style={{ color: INK_MUTED }}
        />
      )}
    </div>
  );
};
