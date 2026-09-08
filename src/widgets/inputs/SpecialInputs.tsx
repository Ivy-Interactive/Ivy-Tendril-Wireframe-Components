import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { icons } from "lucide-react";
import { byDensity, cn, densityIconSize, densityText, formatBytes, widgetStyle } from "@/lib/utils";
import type { FileItem } from "@/lib/types";
import { INK, INK_FAINT, PAPER_RAISED, STROKE, SURFACE, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";
import { BaseInputProps, InputShell, inputPadding, nativeInputClass } from "./InputShell";

const SWATCHES = [
  "Slate", "Gray", "Red", "Orange", "Amber", "Yellow", "Lime", "Green",
  "Emerald", "Teal", "Cyan", "Sky", "Blue", "Indigo", "Violet", "Purple",
  "Fuchsia", "Pink", "Rose", "Black",
];

export type ColorInputVariant = "Text" | "Picker" | "TextAndPicker" | "Swatch" | "SwatchPicker";

export interface ColorInputProps extends BaseInputProps {
  value?: string | null;
  variant?: ColorInputVariant;
  allowAlpha?: boolean;
  foreground?: boolean;
  onChange?: (value: string | null) => void;
}

/** Colour entry as hex text, a native picker, or a swatch grid. Mirrors `Ivy.ColorInput`. */
export const ColorInput = ({
  id,
  value = null,
  variant = "TextAndPicker",
  allowAlpha,
  disabled,
  invalid,
  nullable,
  placeholder = "#000000",
  density = "Medium",
  ghost,
  width = "12rem",
  height,
  aspectRatio,
  visible,
  prefix,
  suffix,
  className,
  style,
  onChange,
}: ColorInputProps) => {
  const swatch = resolveColor(value, "#ffffff");
  const showSwatches = variant === "Swatch" || variant === "SwatchPicker";
  const showText = variant === "Text" || variant === "TextAndPicker";
  const showPicker = variant === "Picker" || variant === "TextAndPicker" || variant === "SwatchPicker";

  const swatchGrid = (
    <div className="grid grid-cols-10 gap-1 p-2">
      {SWATCHES.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          aria-label={name}
          disabled={disabled}
          onClick={() => onChange?.(name)}
          className={cn(
            "h-5 w-5 cursor-pointer border border-ink-faint",
            value === name && "ring-2 ring-ink ring-offset-1",
          )}
          style={{ background: resolveColor(name), borderRadius: "40% 60% 55% 45%" }}
        />
      ))}
    </div>
  );

  if (variant === "Swatch") {
    return (
      <SketchFrame
        id={id}
        seed={id ?? "swatches"}
        stroke={invalid ? resolveColor("Destructive") : INK_FAINT}
        fill={PAPER_RAISED}
        fillStyle="solid"
        className={cn("inline-block", className)}
        contentClassName="block"
        style={widgetStyle({ width, height, aspectRatio, visible, style })}
      >
        {swatchGrid}
      </SketchFrame>
    );
  }

  return (
    <InputShell
      id={id ? `${id}-shell` : undefined}
      disabled={disabled}
      invalid={invalid}
      density={density}
      ghost={ghost}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      visible={visible}
      className={className}
      style={style}
      showClear={Boolean(nullable && value)}
      onClear={() => onChange?.(null)}
      prefix={
        prefix ?? (
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 border border-ink-faint"
            style={{ background: swatch, borderRadius: "45% 55% 50% 50%" }}
          />
        )
      }
      suffix={
        <>
          {showSwatches && (
            <PopoverPrimitive.Root>
              <PopoverPrimitive.Trigger asChild>
                <button type="button" aria-label="Choose colour" disabled={disabled} className="cursor-pointer">
                  <Icon name="Palette" size={densityIconSize(density)} />
                </button>
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content sideOffset={6} className="z-50">
                  <SketchFrame
                    seed={`${id}-swatch-pop`}
                    fill={PAPER_RAISED}
                    fillStyle="solid"
                    className="tendril"
                    contentClassName="block"
                  >
                    {swatchGrid}
                  </SketchFrame>
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
          )}
          {showPicker && (
            <input
              type="color"
              aria-label="Colour picker"
              value={/^#[\da-f]{6}$/i.test(swatch) ? swatch : "#000000"}
              disabled={disabled}
              onChange={(event) => onChange?.(event.target.value)}
              className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
            />
          )}
          {suffix}
        </>
      }
    >
      {showText ? (
        <input
          id={id}
          value={value ?? ""}
          placeholder={allowAlpha ? "#000000ff" : placeholder}
          disabled={disabled}
          className={cn(nativeInputClass, "font-sketch-mono")}
          onChange={(event) => onChange?.(event.target.value || null)}
        />
      ) : (
        <span className={cn("block truncate", !value && "text-ink-faint italic")}>
          {value ?? placeholder}
        </span>
      )}
    </InputShell>
  );
};

export interface IconInputProps extends BaseInputProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
}

const ICON_NAMES = Object.keys(icons);

/** Searchable lucide icon picker. Mirrors `Ivy.IconInput`. */
export const IconInput = ({
  id,
  value = null,
  placeholder = "Pick an icon…",
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "14rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
}: IconInputProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const iconSize = densityIconSize(density);

  const matches = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = needle
      ? ICON_NAMES.filter((name) => name.toLowerCase().includes(needle))
      : ICON_NAMES;
    return source.slice(0, 120);
  }, [query]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <div>
          <InputShell
            id={id}
            disabled={disabled}
            invalid={invalid}
            density={density}
            ghost={ghost}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            visible={visible}
            focused={open}
            className={className}
            style={style}
            showClear={Boolean(nullable && value)}
            onClear={() => onChange?.(null)}
            onClick={() => !disabled && setOpen(true)}
            prefix={value ? <Icon name={value} size={iconSize} /> : undefined}
            suffix={<Icon name="ChevronDown" size={iconSize} />}
          >
            <span className={cn("block cursor-pointer truncate", !value && "text-ink-faint italic")}>
              {value ?? placeholder}
            </span>
          </InputShell>
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50">
          <SketchFrame
            seed={`${id}-icons`}
            fill={PAPER_RAISED}
            fillStyle="solid"
            className={cn("tendril w-72", densityText(density))}
            contentClassName="block"
          >
            <div className={cn("flex items-center gap-2 border-b border-dashed border-ink-faint", inputPadding(density))}>
              <Icon name="Search" size={iconSize} color={INK_FAINT} />
              <input
                autoFocus
                value={query}
                placeholder="Search icons…"
                onChange={(event) => setQuery(event.target.value)}
                className={nativeInputClass}
              />
            </div>
            <div className="grid max-h-56 grid-cols-8 gap-1 overflow-auto p-2">
              {matches.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange?.(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-7 w-7 cursor-pointer items-center justify-center hover:bg-highlight",
                    value === name && "bg-highlight",
                  )}
                >
                  <Icon name={name} size={16} />
                </button>
              ))}
            </div>
          </SketchFrame>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export type FeedbackVariant = "Thumbs" | "Emojis" | "Stars";

export interface FeedbackInputProps extends BaseInputProps {
  value?: number | boolean | null;
  variant?: FeedbackVariant;
  allowHalf?: boolean;
  max?: number;
  onChange?: (value: number | boolean | null) => void;
}

const EMOJIS = ["😞", "🙁", "😐", "🙂", "😀"];

/** Thumbs, stars or emoji rating. Mirrors `Ivy.FeedbackInput`. */
export const FeedbackInput = ({
  id,
  value = null,
  variant = "Stars",
  allowHalf,
  max = 5,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
}: FeedbackInputProps) => {
  const size = byDensity(density, [18, 24, 30]);
  const rootStyle = widgetStyle({ width, height, aspectRatio, visible, style });

  const pick = (next: number | boolean) => {
    if (disabled) return;
    onChange?.(nullable && next === value ? null : next);
  };

  if (variant === "Thumbs") {
    return (
      <div id={id} className={cn("inline-flex items-center gap-2", className)} style={rootStyle} role="group">
        {[true, false].map((thumb) => (
          <button
            key={String(thumb)}
            type="button"
            aria-label={thumb ? "Thumbs up" : "Thumbs down"}
            aria-pressed={value === thumb}
            disabled={disabled}
            onClick={() => pick(thumb)}
            className={cn(
              "cursor-pointer p-1 transition-transform hover:scale-110",
              value === thumb ? "text-ink" : "text-ink-faint",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Icon name={thumb ? "ThumbsUp" : "ThumbsDown"} size={size} />
          </button>
        ))}
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
    );
  }

  if (variant === "Emojis") {
    return (
      <div id={id} className={cn("inline-flex items-center gap-1", className)} style={rootStyle} role="group">
        {EMOJIS.map((emoji, index) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Rating ${index + 1}`}
            aria-pressed={value === index + 1}
            disabled={disabled}
            onClick={() => pick(index + 1)}
            className={cn(
              "cursor-pointer p-0.5 transition-transform hover:scale-125",
              value === index + 1 ? "scale-125" : "opacity-45 grayscale",
              disabled && "cursor-not-allowed",
            )}
            style={{ fontSize: size }}
          >
            {emoji}
          </button>
        ))}
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
    );
  }

  const rating = typeof value === "number" ? value : 0;

  return (
    <div id={id} className={cn("inline-flex items-center gap-0.5", className)} style={rootStyle} role="group">
      {Array.from({ length: max }).map((_, index) => {
        const filled = rating >= index + 1;
        const half = allowHalf && !filled && rating >= index + 0.5;
        return (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1} of ${max}`}
            disabled={disabled}
            onClick={() => pick(index + 1)}
            className={cn("cursor-pointer p-0.5", disabled && "cursor-not-allowed opacity-50")}
          >
            <Icon
              name={half ? "StarHalf" : "Star"}
              size={size}
              color={filled || half ? resolveColor("Amber") : INK_FAINT}
              className={cn(filled && "fill-current")}
            />
          </button>
        );
      })}
      {invalid && <span className="ml-2 text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export interface FileInputProps extends BaseInputProps {
  value?: FileItem | FileItem[] | null;
  accept?: string;
  maxFileSize?: number;
  minFileSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  variant?: "Default" | "Drop";
  /** Endpoint the host uploads to; surfaced so callers can wire their own upload. */
  uploadUrl?: string;
  onChange?: (files: File[]) => void;
  onRemove?: (file: FileItem) => void;
}

/**
 * File chooser with a drop-zone variant. Mirrors `Ivy.FileInput`.
 *
 * @tags upload attachment drop-zone
 * @example <FileInput variant="Drop" accept=".png,.jpg" onChange={upload} />
 */
export const FileInput = ({
  id,
  value,
  accept,
  maxFileSize,
  multiple,
  maxFiles,
  variant = "Default",
  uploadUrl,
  placeholder = "Choose a file",
  disabled,
  invalid,
  density = "Medium",
  width = "20rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
  onRemove,
}: FileInputProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const files = value ? (Array.isArray(value) ? value : [value]) : [];
  const iconSize = densityIconSize(density);

  const openPicker = () => !disabled && inputRef.current?.click();

  const fileList = files.length > 0 && (
    <ul className="mt-2 flex list-none flex-col gap-1 p-0 text-xs">
      {files.map((file) => (
        <li key={file.id} className="flex items-center gap-2">
          <Icon name="File" size={14} />
          <span className="min-w-0 flex-1 truncate">{file.fileName}</span>
          <span className="text-ink-faint">{formatBytes(file.length)}</span>
          {file.status === "Loading" && <span className="text-ink-faint">{file.progress}%</span>}
          {file.status === "Failed" && <span className="text-destructive">failed</span>}
          {onRemove && (
            <button
              type="button"
              aria-label={`Remove ${file.fileName}`}
              onClick={() => onRemove(file)}
              className="cursor-pointer text-ink-faint hover:text-ink"
            >
              <Icon name="X" size={12} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  const nativeInput = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      className="hidden"
      data-upload-url={uploadUrl}
      onChange={(event) => onChange?.(Array.from(event.target.files ?? []))}
    />
  );

  if (variant === "Drop") {
    return (
      <div
        className={cn("inline-block", className)}
        style={widgetStyle({ width, height, aspectRatio, visible, style })}
      >
        <SketchFrame
          seed={id ?? "dropzone"}
          outline="dashed"
          stroke={invalid ? resolveColor("Destructive") : dragging ? INK : INK_FAINT}
          strokeWidth={dragging ? 1.8 : 1.3}
          fill={dragging ? "#fff6c8" : PAPER_RAISED}
          fillStyle="solid"
          onClick={openPicker}
          onDragOver={(event: React.DragEvent) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event: React.DragEvent) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled) onChange?.(Array.from(event.dataTransfer.files));
          }}
          className={cn("block w-full", disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer")}
          contentClassName="flex flex-col items-center gap-1 px-4 py-8 text-center"
        >
          {nativeInput}
          <Icon name="Upload" size={26} color={INK_FAINT} />
          <span className={densityText(density)}>{placeholder}</span>
          <span className="text-xs text-ink-faint">
            {accept ? `${accept} · ` : ""}
            {maxFileSize ? `max ${formatBytes(maxFileSize)}` : "drag and drop or click"}
            {maxFiles ? ` · up to ${maxFiles} files` : ""}
          </span>
        </SketchFrame>
        {fileList}
        {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <InputShell
        id={id ? `${id}-shell` : undefined}
        disabled={disabled}
        invalid={invalid}
        density={density}
        width="100%"
        onClick={openPicker}
        prefix={<Icon name="Paperclip" size={iconSize} />}
        suffix={<Icon name="Upload" size={iconSize} />}
      >
        {nativeInput}
        <span className={cn("block cursor-pointer truncate", !files.length && "text-ink-faint italic")}>
          {files.length ? files.map((file) => file.fileName).join(", ") : placeholder}
        </span>
      </InputShell>
      {fileList}
    </div>
  );
};

export interface SignatureInputProps extends BaseInputProps {
  /** Data URL of the drawn signature. */
  value?: string | null;
  pen?: string;
  background?: string;
  penThickness?: number;
  /** `Bordered` keeps the frame; `Ghost` drops it, as in Ivy. */
  variant?: "Bordered" | "Ghost";
  onChange?: (value: string | null) => void;
}

/** Draw-your-name pad. Mirrors `Ivy.SignatureInput`. */
export const SignatureInput = ({
  id,
  value,
  pen = "Primary",
  background,
  penThickness = 2,
  variant = "Bordered",
  placeholder = "Sign here",
  disabled,
  invalid,
  density = "Medium",
  width = "22rem",
  height: rootHeight,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
}: SignatureInputProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasInk, setHasInk] = React.useState(Boolean(value));
  const height = byDensity(density, [90, 120, 150]);

  const context = () => canvasRef.current?.getContext("2d") ?? null;

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const ctx = context();
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = point(event);
    ctx.strokeStyle = resolveColor(pen, INK);
    ctx.lineWidth = penThickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = context();
    if (!ctx) return;
    const { x, y } = point(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange?.(canvasRef.current?.toDataURL() ?? null);
  };

  const clear = () => {
    const ctx = context();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasInk(false);
    onChange?.(null);
  };

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, height: rootHeight, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? "signature"}
        outline={variant === "Ghost" ? "none" : "solid"}
        stroke={invalid ? resolveColor("Destructive") : INK_FAINT}
        fill={background ? resolveColor(background) : PAPER_RAISED}
        fillStyle="solid"
        className="relative block w-full"
        contentClassName="block"
      >
        <canvas
          ref={canvasRef}
          id={id}
          height={height}
          className={cn("block w-full touch-none", disabled ? "cursor-not-allowed" : "cursor-crosshair")}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-ink-faint italic">
            {placeholder}
          </span>
        )}
      </SketchFrame>
      <div className="mt-1 flex justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || !hasInk}
          className="cursor-pointer text-xs text-ink-muted sketch-underline disabled:opacity-40"
        >
          Clear
        </button>
      </div>
      {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export interface CodeInputProps extends BaseInputProps {
  value?: string;
  language?: string;
  /** Ivy's editor flavour. `Default` shows line numbers; `Ghost` drops the chrome. */
  variant?: "Default" | "Ghost";
  showCopyButton?: boolean;
  onChange?: (value: string | null) => void;
}

/** Plain-text code editor with line numbers. Mirrors `Ivy.CodeInput`. */
export const CodeInput = ({
  id,
  value = "",
  language,
  variant = "Default",
  showCopyButton,
  placeholder,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  width = "28rem",
  height = "12rem",
  aspectRatio,
  visible,
  autoFocus,
  className,
  style,
  onChange,
}: CodeInputProps) => {
  const [copied, setCopied] = React.useState(false);
  const lineCount = value.split("\n").length;

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? "code-input"}
        outline={variant === "Ghost" ? "none" : "solid"}
        stroke={invalid ? resolveColor("Destructive") : INK_FAINT}
        fill={SURFACE.code}
        fillStyle="solid"
        className="relative block w-full"
        contentClassName="flex overflow-hidden"
        style={widgetStyle({ height })}
      >
        {showCopyButton && (
          <button
            type="button"
            aria-label="Copy code"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1400);
              } catch {
                setCopied(false);
              }
            }}
            className="absolute top-1.5 right-1.5 z-[2] cursor-pointer p-1 text-ink-muted hover:text-ink"
          >
            <Icon name={copied ? "Check" : "Copy"} size={14} />
          </button>
        )}
        {variant !== "Ghost" && (
          <span className="shrink-0 border-r border-dashed border-ink-faint px-2 py-2 text-right font-sketch-mono text-xs text-ink-faint select-none">
            {Array.from({ length: lineCount }).map((_, index) => (
              <span key={index} className="block leading-relaxed">
                {index + 1}
              </span>
            ))}
          </span>
        )}
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          spellCheck={false}
          data-language={language}
          className={cn(
            nativeInputClass,
            "h-full flex-1 resize-none px-2 py-2 font-sketch-mono text-xs leading-relaxed",
            densityText(density),
          )}
          onChange={(event) => onChange?.(nullable && !event.target.value ? null : event.target.value)}
        />
      </SketchFrame>
      {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export interface ContentInputProps extends BaseInputProps {
  value?: string;
  maxLength?: number;
  rows?: number;
  files?: FileItem[];
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  uploadUrl?: string;
  shortcutKey?: string;
  onChange?: (value: string | null) => void;
  onAttach?: (files: File[]) => void;
  onSubmit?: (value: string) => void;
}

/**
 * Composer for a message plus its attachments — the input at the bottom of a
 * chat. Mirrors `Ivy.ContentInput`.
 */
export const ContentInput = ({
  id,
  value = "",
  maxLength,
  rows = 3,
  files = [],
  accept,
  maxFiles,
  maxFileSize,
  uploadUrl,
  shortcutKey,
  placeholder = "Write something…",
  disabled,
  invalid,
  density = "Medium",
  width = "28rem",
  height,
  aspectRatio,
  visible,
  autoFocus,
  className,
  style,
  onChange,
  onAttach,
  onSubmit,
}: ContentInputProps) => {
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? "content-input"}
        stroke={invalid ? resolveColor("Destructive") : INK_FAINT}
        fill={PAPER_RAISED}
        fillStyle="solid"
        className="block w-full"
        contentClassName="block p-2"
      >
        <textarea
          id={id}
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(nativeInputClass, "resize-y leading-relaxed", densityText(density))}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) onSubmit?.(value);
          }}
        />
        {files.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1.5">
            {files.map((file) => (
              <span
                key={file.id}
                className="flex items-center gap-1 border border-dashed border-ink-faint px-1.5 py-0.5 text-xs"
              >
                <Icon name="Paperclip" size={11} />
                {file.fileName}
              </span>
            ))}
          </span>
        )}
        <span className="mt-2 flex items-center justify-between border-t border-dashed border-ink-faint pt-2">
          <span className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              multiple={maxFiles !== 1}
              className="hidden"
              data-upload-url={uploadUrl}
              data-max-file-size={maxFileSize}
              onChange={(event) => onAttach?.(Array.from(event.target.files ?? []))}
            />
            <button
              type="button"
              aria-label="Attach files"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer text-ink-muted hover:text-ink"
            >
              <Icon name="Paperclip" size={16} />
            </button>
            {maxLength && (
              <span className="text-[10px] text-ink-faint">
                {value.length}/{maxLength}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            {shortcutKey && <span className="font-sketch-mono text-[10px] text-ink-faint">{shortcutKey}</span>}
            <button
              type="button"
              aria-label="Send"
              disabled={disabled || !value.trim()}
              onClick={() => onSubmit?.(value)}
              className="cursor-pointer text-ink-muted hover:text-ink disabled:opacity-40"
            >
              <Icon name="SendHorizontal" size={16} />
            </button>
          </span>
        </span>
      </SketchFrame>
      {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export interface AudioInputProps extends BaseInputProps {
  label?: string;
  recordingLabel?: string;
  /** Seconds recorded so far; drives the waveform. */
  elapsed?: number;
  recording?: boolean;
  onToggleRecording?: (recording: boolean) => void;
}

/** Push-to-record control with a scribbled waveform. Mirrors `Ivy.AudioInput`. */
export const AudioInput = ({
  id,
  label = "Record",
  recordingLabel = "Recording…",
  elapsed = 0,
  recording = false,
  disabled,
  invalid,
  density = "Medium",
  width = "18rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
  onToggleRecording,
}: AudioInputProps) => {
  const { ref, width: w } = useMeasuredSize<HTMLSpanElement>();
  const waveHeight = byDensity(density, [22, 28, 36]);

  const points = React.useMemo<[number, number][]>(() => {
    const count = Math.max(2, Math.floor(w / 6));
    return Array.from({ length: count }, (_, index) => {
      const amplitude = recording ? Math.sin(index * 0.9 + elapsed) * 0.42 + 0.5 : 0.5;
      return [index * 6, waveHeight * (1 - amplitude)] as [number, number];
    });
  }, [w, recording, elapsed, waveHeight]);

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? "audio-input"}
        corner="pill"
        stroke={invalid ? resolveColor("Destructive") : recording ? resolveColor("Destructive") : INK_FAINT}
        fill={PAPER_RAISED}
        fillStyle="solid"
        className="block w-full"
        contentClassName="flex items-center gap-3 px-3 py-2"
      >
        <button
          type="button"
          id={id}
          aria-label={recording ? "Stop recording" : "Start recording"}
          disabled={disabled}
          onClick={() => onToggleRecording?.(!recording)}
          className={cn(
            "shrink-0 cursor-pointer",
            recording ? "text-destructive" : "text-ink",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <Icon name={recording ? "Square" : "Mic"} size={20} />
        </button>
        <span ref={ref} className="relative block h-full min-w-0 flex-1" style={{ height: waveHeight }}>
          {w > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
              <RoughShape
                shape={{ kind: "linearPath", points }}
                seed={`${id}-wave`}
                stroke={recording ? resolveColor("Destructive") : INK_FAINT}
                strokeWidth={STROKE.regular}
                roughness={1.8}
              />
            </svg>
          )}
        </span>
        <span className="shrink-0 font-sketch-mono text-xs text-ink-muted">
          {recording ? recordingLabel : label}
        </span>
      </SketchFrame>
      {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export interface CameraInputProps extends BaseInputProps {
  facingMode?: "user" | "environment";
  /** Data URL of the captured frame. */
  value?: string | null;
  /** Endpoint the host uploads captures to. */
  uploadUrl?: string;
  onCapture?: () => void;
  onClear?: () => void;
}

/** Viewfinder and shutter. Mirrors `Ivy.CameraInput`. */
export const CameraInput = ({
  id,
  facingMode = "user",
  value,
  uploadUrl,
  placeholder = "Camera preview",
  disabled,
  invalid,
  density = "Medium",
  width = "20rem",
  height: rootHeight,
  aspectRatio,
  visible,
  className,
  style,
  onCapture,
  onClear,
}: CameraInputProps) => {
  const viewHeight = byDensity(density, [140, 180, 240]);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLSpanElement>();

  return (
    <div
      className={cn("inline-block", className)}
      style={widgetStyle({ width, height: rootHeight, aspectRatio, visible, style })}
      data-upload-url={uploadUrl}
    >
      <SketchFrame
        seed={id ?? "camera"}
        stroke={invalid ? resolveColor("Destructive") : INK_FAINT}
        fill={SURFACE.sunken}
        fillStyle="solid"
        className="block w-full overflow-hidden"
        contentClassName="block"
      >
        <span ref={ref} className="relative flex items-center justify-center" style={{ height: viewHeight }}>
          {value ? (
            <img src={value} alt="Captured" className="h-full w-full object-cover" />
          ) : (
            <>
              {w > 4 && h > 4 && (
                <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
                  <RoughShape
                    shape={{ kind: "line", x1: 2, y1: 2, x2: w - 2, y2: h - 2 }}
                    seed="cam-x1"
                    stroke={INK_FAINT}
                    strokeWidth={STROKE.thin}
                  />
                  <RoughShape
                    shape={{ kind: "line", x1: w - 2, y1: 2, x2: 2, y2: h - 2 }}
                    seed="cam-x2"
                    stroke={INK_FAINT}
                    strokeWidth={STROKE.thin}
                  />
                </svg>
              )}
              <span className="relative flex flex-col items-center gap-1 bg-paper-sunken px-2 text-xs text-ink-muted italic">
                <Icon name={facingMode === "user" ? "User" : "Aperture"} size={22} />
                {placeholder}
              </span>
            </>
          )}
        </span>
        <span className="flex items-center justify-center gap-3 border-t border-dashed border-ink-faint py-2">
          <button
            type="button"
            id={id}
            aria-label="Take photo"
            disabled={disabled}
            onClick={onCapture}
            className={cn("cursor-pointer", disabled && "cursor-not-allowed opacity-50")}
          >
            <Icon name="Camera" size={22} />
          </button>
          {value && (
            <button
              type="button"
              aria-label="Discard photo"
              onClick={onClear}
              className="cursor-pointer text-ink-muted hover:text-ink"
            >
              <Icon name="Trash2" size={18} />
            </button>
          )}
        </span>
      </SketchFrame>
      {invalid && <span className="mt-1 block text-xs text-destructive">{invalid}</span>}
    </div>
  );
};
