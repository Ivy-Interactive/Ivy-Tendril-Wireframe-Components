import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, sizeStyle } from "@/lib/utils";
import type { Densities, Sizing, WidgetBaseProps } from "@/lib/types";
import { INK, INK_FAINT, PAPER_RAISED, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

/** Props every Ivy input shares. */
export interface BaseInputProps extends WidgetBaseProps {
  disabled?: boolean;
  /** Validation message. Any non-empty string marks the field invalid. */
  invalid?: string;
  nullable?: boolean;
  placeholder?: string;
  density?: Densities;
  autoFocus?: boolean;
  /** Renders the field without its border, for embedding in toolbars. */
  ghost?: boolean;
  width?: Sizing;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const inputPadding = (density?: Densities) =>
  byDensity(density, ["px-2 py-1", "px-2.5 py-1.5", "px-3.5 py-2.5"]);

export interface InputShellProps extends BaseInputProps {
  children?: React.ReactNode;
  /** Shows the clear affordance. Pair with `onClear`. */
  showClear?: boolean;
  onClear?: () => void;
  focused?: boolean;
  className?: string;
  contentClassName?: string;
  corner?: "rounded" | "pill" | "sharp";
  height?: Sizing;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * The bordered box every text-like input sits in: prefix, content, suffix,
 * clear button and the red squiggle for validation errors.
 */
export const InputShell = ({
  id,
  children,
  disabled,
  invalid,
  density = "Medium",
  ghost,
  width,
  height,
  prefix,
  suffix,
  showClear,
  onClear,
  focused,
  corner = "rounded",
  className,
  contentClassName,
  style,
  onClick,
}: InputShellProps) => {
  const iconSize = densityIconSize(density);
  const stroke = invalid ? resolveColor("Destructive") : focused ? INK : INK_FAINT;

  return (
    <div className={cn("inline-flex flex-col gap-1", className)} style={{ ...sizeStyle(width), ...style }}>
      <SketchFrame
        id={id}
        seed={id ?? "input"}
        corner={corner}
        outline={ghost ? "none" : "solid"}
        stroke={stroke}
        strokeWidth={focused || invalid ? 1.6 : 1.2}
        doubleStroke={focused}
        fill={ghost ? undefined : PAPER_RAISED}
        fillStyle="solid"
        onClick={onClick}
        className={cn("w-full", disabled && "cursor-not-allowed opacity-55")}
        contentClassName={cn(
          "flex items-center gap-1.5",
          inputPadding(density),
          densityText(density),
          contentClassName,
        )}
        style={sizeStyle(undefined, height)}
      >
        {prefix && <span className="flex shrink-0 items-center text-ink-muted">{prefix}</span>}
        <span className="flex min-w-0 flex-1 items-center">{children}</span>
        {showClear && !disabled && (
          <button
            type="button"
            aria-label="Clear"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="shrink-0 cursor-pointer text-ink-faint hover:text-ink"
          >
            <Icon name="X" size={iconSize} />
          </button>
        )}
        {invalid && (
          <span title={invalid} className="shrink-0 text-destructive">
            <Icon name="CircleAlert" size={iconSize} />
          </span>
        )}
        {suffix && <span className="flex shrink-0 items-center text-ink-muted">{suffix}</span>}
      </SketchFrame>
      {invalid && <span className="text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

/** Strips the shell's chrome props so the rest can be spread onto an `<input>`. */
export const nativeInputClass =
  "w-full min-w-0 border-0 bg-transparent p-0 outline-none placeholder:text-ink-faint placeholder:italic disabled:cursor-not-allowed";
