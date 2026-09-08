import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn, sizeStyle, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { INK_FAINT, PAPER_RAISED, STROKE } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { SketchFrame } from "@/sketch/SketchFrame";

const Overlay = () => (
  <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#2f2f2f]/25 backdrop-blur-[1px]" />
);

export interface DialogProps extends WidgetBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  /** Element that opens the dialog. */
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

/**
 * Modal window. Mirrors `Ivy.Dialog`.
 *
 * @tags modal overlay confirm
 * @example <Dialog open={open} onOpenChange={setOpen}><DialogHeader title="Delete?" /></Dialog>
 */
export const Dialog = ({
  id,
  open,
  defaultOpen,
  children,
  trigger,
  width = "28rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
  onOpenChange,
  onClose,
}: DialogProps) => (
  <DialogPrimitive.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={(next) => {
      onOpenChange?.(next);
      if (!next) onClose?.();
    }}
  >
    {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        id={id}
        className="tendril fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 focus:outline-none"
        style={{
          maxWidth: sizeStyle(width).width,
          ...widgetStyle({ height, aspectRatio, visible, style }),
        }}
      >
        <SketchFrame
          seed={`${id}-dialog`}
          corner="rounded"
          fill={PAPER_RAISED}
          fillStyle="solid"
          strokeWidth={STROKE.heavy}
          doubleStroke
          className={cn("block -rotate-[0.15deg]", className)}
          contentClassName="flex max-h-[85vh] flex-col overflow-hidden"
        >
          {children}
        </SketchFrame>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

export interface DialogHeaderProps extends WidgetBaseProps {
  title?: string;
  description?: string;
  hideCloseButton?: boolean;
  children?: React.ReactNode;
}

/** Mirrors `Ivy.DialogHeader`. */
export const DialogHeader = ({
  id,
  title,
  description,
  hideCloseButton,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: DialogHeaderProps) => (
  <div
    id={id}
    className={cn(
      "flex items-start gap-3 border-b border-dashed border-ink-faint px-5 py-3.5",
      className,
    )}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <div className="min-w-0 flex-1">
      {title && <DialogPrimitive.Title className="text-lg font-bold">{title}</DialogPrimitive.Title>}
      {description && (
        <DialogPrimitive.Description className="mt-0.5 text-sm text-ink-muted">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
    </div>
    {!hideCloseButton && (
      <DialogPrimitive.Close aria-label="Close" className="cursor-pointer p-1 text-ink-muted hover:text-ink">
        <Icon name="X" size={18} />
      </DialogPrimitive.Close>
    )}
  </div>
);

export interface DialogBodyProps extends WidgetBaseProps {
  children?: React.ReactNode;
}

/** Mirrors `Ivy.DialogBody`. */
export const DialogBody = ({
  id,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: DialogBodyProps) => (
  <div
    id={id}
    className={cn("flex-1 overflow-auto px-5 py-4", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    {children}
  </div>
);

export interface DialogFooterProps extends WidgetBaseProps {
  children?: React.ReactNode;
}

/** Mirrors `Ivy.DialogFooter`. */
export const DialogFooter = ({
  id,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: DialogFooterProps) => (
  <div
    id={id}
    className={cn(
      "flex items-center justify-end gap-2 border-t border-dashed border-ink-faint px-5 py-3.5",
      className,
    )}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    {children}
  </div>
);

export type SheetSide = "Left" | "Right" | "Top" | "Bottom";

export interface SheetProps extends WidgetBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  side?: SheetSide;
  resizable?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

const SHEET_POSITION: Record<SheetSide, string> = {
  Left: "inset-y-0 left-0",
  Right: "inset-y-0 right-0",
  Top: "inset-x-0 top-0",
  Bottom: "inset-x-0 bottom-0",
};

/**
 * Panel that slides in from an edge. Mirrors `Ivy.Sheet`.
 *
 * @tags drawer panel overlay
 * @example <Sheet open={open} onOpenChange={setOpen} title="Filters" side="Right" />
 */
export const Sheet = ({
  id,
  open,
  defaultOpen,
  title,
  description,
  trigger,
  children,
  width = "24rem",
  height = "20rem",
  aspectRatio,
  visible,
  side = "Right",
  resizable,
  className,
  style,
  onOpenChange,
  onClose,
}: SheetProps) => {
  const horizontal = side === "Left" || side === "Right";

  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        onOpenChange?.(next);
        if (!next) onClose?.();
      }}
    >
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <Overlay />
        <DialogPrimitive.Content
          id={id}
          className={cn("tendril fixed z-50 focus:outline-none", SHEET_POSITION[side], className)}
          style={{
            ...(horizontal ? { width: sizeStyle(width).width } : { height: sizeStyle(height).height }),
            ...(horizontal ? { height: "100%" } : { width: "100%" }),
            resize: resizable ? (horizontal ? "horizontal" : "vertical") : undefined,
            overflow: resizable ? "auto" : undefined,
            ...widgetStyle({ aspectRatio, visible, style }),
          }}
        >
          <SketchFrame
            seed={`${id}-sheet`}
            corner="sharp"
            fill={PAPER_RAISED}
            fillStyle="solid"
            className="block h-full w-full"
            contentClassName="flex h-full flex-col"
          >
            <div className="flex items-start gap-3 border-b border-dashed border-ink-faint px-5 py-3.5">
              <div className="min-w-0 flex-1">
                {title && (
                  <DialogPrimitive.Title className="text-lg font-bold">{title}</DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="mt-0.5 text-sm text-ink-muted">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className="cursor-pointer p-1 text-ink-muted hover:text-ink"
              >
                <Icon name="X" size={18} />
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
          </SketchFrame>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export interface BladeContainerProps extends WidgetBaseProps {
  children?: React.ReactNode;
}

/** Horizontal stack of drill-down blades. Mirrors `Ivy.BladeContainer`. */
export const BladeContainer = ({
  id,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: BladeContainerProps) => (
  <div
    id={id}
    className={cn("flex h-full items-stretch gap-3 overflow-x-auto", className)}
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    {children}
  </div>
);

export interface BladeProps extends WidgetBaseProps {
  title?: string;
  index?: number;
  header?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  onRefresh?: () => void;
}

/** One panel inside a `BladeContainer`. Mirrors `Ivy.Blade`. */
export const Blade = ({
  id,
  title,
  width = "22rem",
  height = "100%",
  aspectRatio,
  visible,
  index = 0,
  header,
  children,
  className,
  style,
  onClose,
  onRefresh,
}: BladeProps) => (
  <SketchFrame
    id={id}
    seed={id ?? `blade-${index}`}
    corner="rounded"
    stroke={INK_FAINT}
    fill={PAPER_RAISED}
    fillStyle="solid"
    className={cn("block shrink-0", className)}
    contentClassName="flex h-full flex-col overflow-hidden"
    style={widgetStyle({ width, height, aspectRatio, visible, style })}
  >
    <div className="flex items-center gap-2 border-b border-dashed border-ink-faint px-4 py-2.5">
      <span className="min-w-0 flex-1 truncate font-bold">{title}</span>
      {header}
      {onRefresh && (
        <button type="button" aria-label="Refresh" onClick={onRefresh} className="cursor-pointer p-1 text-ink-muted hover:text-ink">
          <Icon name="RefreshCw" size={14} />
        </button>
      )}
      {onClose && index > 0 && (
        <button type="button" aria-label="Close blade" onClick={onClose} className="cursor-pointer p-1 text-ink-muted hover:text-ink">
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
    <div className="flex-1 overflow-auto p-4">{children}</div>
  </SketchFrame>
);
