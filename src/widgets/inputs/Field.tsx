import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { Icon } from "@/sketch/Icon";
import { Tooltip } from "../Menus";

export interface FieldProps extends WidgetBaseProps {
  label?: string;
  description?: string;
  required?: boolean;
  /** Rendered as a tooltip on a question-mark icon beside the label. */
  help?: string;
  /** Buttons or links shown at the right of the label row. */
  tools?: React.ReactNode;
  labelPosition?: "Top" | "Left";
  children?: React.ReactNode;
}

/** Label, description and help around any input. Mirrors `Ivy.Field`. */
export const Field = ({
  id,
  label,
  description,
  required,
  help,
  tools,
  labelPosition = "Top",
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  children,
  className,
  style,
}: FieldProps) => {
  const side = labelPosition === "Left";

  return (
    <div
      id={id}
      className={cn(
        "flex",
        side ? "flex-row items-start gap-4" : "flex-col",
        byDensity(density, ["gap-1", "gap-1.5", "gap-2"]),
        className,
      )}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {(label || tools) && (
        <div className={cn("flex items-center gap-1.5", side ? "w-40 shrink-0 pt-2" : "w-full")}>
          {label && (
            <label htmlFor={id} className="text-sm font-bold">
              {label}
              {required && (
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {help && (
            <Tooltip
              content={help}
              trigger={
                <span className="cursor-help text-ink-faint">
                  <Icon name="CircleHelp" size={13} />
                </span>
              }
            />
          )}
          {tools && <span className="ml-auto flex items-center gap-1">{tools}</span>}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {children}
        {description && <p className="mt-1 text-xs text-ink-muted">{description}</p>}
      </div>
    </div>
  );
};

export interface FormProps extends WidgetBaseProps {
  children?: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

/** Groups fields and captures submit. Mirrors `Ivy.Form`. */
export const Form = ({
  id,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onSubmit,
}: FormProps) => (
  <form
    id={id}
    noValidate
    className={cn("flex flex-col gap-4", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit?.(event);
    }}
  >
    {children}
  </form>
);
