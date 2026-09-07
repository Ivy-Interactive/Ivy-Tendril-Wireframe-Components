import { cn, widgetStyle } from "@/lib/utils";
import type { TextAlignment, WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, STROKE } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export interface SeparatorProps extends WidgetBaseProps {
  orientation?: "Horizontal" | "Vertical";
  text?: string;
  textAlign?: TextAlignment;
}

/** A hand-drawn rule, optionally with a label. Mirrors `Ivy.Separator`. */
export const Separator = ({
  id,
  orientation = "Horizontal",
  text,
  textAlign = "Center",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: SeparatorProps) => {
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const vertical = orientation === "Vertical";

  const line = (length: number) =>
    vertical
      ? ({ kind: "line", x1: 1, y1: 0, x2: 1, y2: length } as const)
      : ({ kind: "line", x1: 0, y1: 1, x2: length, y2: 1 } as const);

  if (vertical) {
    return (
      <div
        id={id}
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn("relative w-[3px] self-stretch", className)}
        style={widgetStyle({ width, height: height ?? "100%", aspectRatio, visible, style })}
      >
        {h > 0 && (
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
            <RoughShape shape={line(h)} seed={`${id}-sep`} stroke={INK_FAINT} strokeWidth={STROKE.regular} />
          </svg>
        )}
      </div>
    );
  }

  if (!text) {
    return (
      <div
        id={id}
        ref={ref}
        role="separator"
        className={cn("relative h-[3px] w-full", className)}
        style={widgetStyle({ width: width ?? "100%", height, aspectRatio, visible, style })}
      >
        {w > 0 && (
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
            <RoughShape shape={line(w)} seed={`${id}-sep`} stroke={INK_FAINT} strokeWidth={STROKE.regular} />
          </svg>
        )}
      </div>
    );
  }

  const label = (
    <span className="shrink-0 text-xs tracking-wide text-ink-muted uppercase">{text}</span>
  );

  return (
    <div
      id={id}
      role="separator"
      className={cn("flex w-full items-center gap-3", className)}
      style={widgetStyle({ width: width ?? "100%", height, aspectRatio, visible, style })}
    >
      {textAlign !== "Left" && <SeparatorRule seed={`${id}-a`} />}
      {label}
      {textAlign !== "Right" && <SeparatorRule seed={`${id}-b`} />}
    </div>
  );
};

const SeparatorRule = ({ className, seed }: { className?: string; seed: string }) => {
  const { ref, width } = useMeasuredSize<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("relative h-[3px] flex-1", className)}>
      {width > 0 && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          <RoughShape
            shape={{ kind: "line", x1: 0, y1: 1, x2: width, y2: 1 }}
            seed={seed}
            stroke={INK_FAINT}
            strokeWidth={STROKE.regular}
          />
        </svg>
      )}
    </div>
  );
};
