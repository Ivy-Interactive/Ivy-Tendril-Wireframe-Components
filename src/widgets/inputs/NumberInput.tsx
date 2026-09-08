import * as React from "react";
import { byDensity, cn, densityIconSize, densityText, widgetStyle } from "@/lib/utils";
import { INK, INK_FAINT, PAPER_RAISED, STROKE, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";
import { BaseInputProps, InputShell, nativeInputClass } from "./InputShell";
import { formatBytes } from "@/lib/utils";

export type FormatStyle =
  | "Decimal"
  | "Currency"
  | "Percent"
  | "Compact"
  | "Scientific"
  | "Engineering"
  | "Accounting"
  | "Bytes";

export function formatNumber(
  value: number,
  formatStyle: FormatStyle = "Decimal",
  precision?: number,
  currency = "USD",
  noGrouping?: boolean,
): string {
  if (formatStyle === "Bytes") return formatBytes(value);

  const options: Intl.NumberFormatOptions = { useGrouping: !noGrouping };
  if (precision !== undefined) {
    options.minimumFractionDigits = precision;
    options.maximumFractionDigits = precision;
  }

  switch (formatStyle) {
    case "Currency":
      return new Intl.NumberFormat(undefined, { ...options, style: "currency", currency }).format(value);
    case "Percent":
      return new Intl.NumberFormat(undefined, { ...options, style: "percent" }).format(value);
    case "Compact":
      return new Intl.NumberFormat(undefined, { ...options, notation: "compact" }).format(value);
    case "Scientific":
      return value.toExponential(precision ?? 2);
    case "Engineering": {
      const exponent = Math.floor(Math.log10(Math.abs(value) || 1) / 3) * 3;
      return `${(value / 10 ** exponent).toFixed(precision ?? 2)}e${exponent}`;
    }
    case "Accounting":
      return value < 0
        ? `(${new Intl.NumberFormat(undefined, { ...options, style: "currency", currency }).format(Math.abs(value))})`
        : new Intl.NumberFormat(undefined, { ...options, style: "currency", currency }).format(value);
    default:
      return new Intl.NumberFormat(undefined, options).format(value);
  }
}

/** Ranges Ivy clamps to when a numeric input is bound to a CLR type. */
export const TYPE_LIMITS: Record<string, { min: number; max: number }> = {
  byte: { min: 0, max: 255 },
  sbyte: { min: -128, max: 127 },
  short: { min: -32768, max: 32767 },
  ushort: { min: 0, max: 65535 },
  int: { min: -2147483648, max: 2147483647 },
  uint: { min: 0, max: 4294967295 },
  long: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
  ulong: { min: 0, max: Number.MAX_SAFE_INTEGER },
};

/**
 * Slider track and thumb, drawn with rough.js.
 *
 * @internal
 */
const SketchSlider = ({
  value,
  min,
  max,
  step,
  disabled,
  seed,
  onChange,
  height = 22,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  seed: string;
  onChange: (value: number) => void;
  height?: number;
}) => {
  const { ref, width } = useMeasuredSize<HTMLDivElement>();
  const ratio = max === min ? 0 : (value - min) / (max - min);
  const knobX = 8 + ratio * Math.max(0, width - 16);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 && (
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          <RoughShape
            shape={{ kind: "line", x1: 4, y1: height / 2, x2: width - 4, y2: height / 2 }}
            seed={`${seed}-track`}
            stroke={INK_FAINT}
            strokeWidth={STROKE.regular}
          />
          <RoughShape
            shape={{ kind: "line", x1: 4, y1: height / 2, x2: knobX, y2: height / 2 }}
            seed={`${seed}-filled`}
            stroke={INK}
            strokeWidth={STROKE.heavy}
          />
          <RoughShape
            shape={{ kind: "circle", cx: knobX, cy: height / 2, diameter: height - 8 }}
            seed={`${seed}-knob`}
            stroke={INK}
            strokeWidth={STROKE.regular}
            fill={PAPER_RAISED}
            fillStyle="solid"
          />
        </svg>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
};

export interface NumberInputProps extends BaseInputProps {
  value?: number | null;
  variant?: "Number" | "Slider";
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatStyle?: FormatStyle;
  currency?: string;
  noGrouping?: boolean;
  /** Ivy's CLR type name, used to clamp to that type's range (e.g. `"int"`). */
  targetType?: string;
  /** Hides the stepper buttons on the `Number` variant. */
  hideStepper?: boolean;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
}

/**
 * Numeric entry, as a field or a slider. Mirrors `Ivy.NumberInput`.
 *
 * @tags number currency slider numeric
 * @example <NumberInput value={price} formatStyle="Currency" currency="EUR" onChange={setPrice} />
 */
export const NumberInput = ({
  id,
  value = null,
  variant = "Number",
  min,
  max,
  step = 1,
  precision,
  formatStyle = "Decimal",
  currency,
  noGrouping,
  targetType,
  hideStepper,
  placeholder,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  ghost,
  width = "12rem",
  height,
  aspectRatio,
  visible,
  autoFocus,
  prefix,
  suffix,
  className,
  style,
  onChange,
  onBlur,
  ...rest
}: NumberInputProps) => {
  const [focused, setFocused] = React.useState(false);
  const [draft, setDraft] = React.useState<string | null>(null);
  const iconSize = densityIconSize(density);

  const display =
    draft !== null
      ? draft
      : value === null
        ? ""
        : focused
          ? String(value)
          : formatNumber(value, formatStyle, precision, currency, noGrouping);

  const commit = (raw: string) => {
    setDraft(null);
    if (raw.trim() === "") return onChange?.(nullable ? null : 0);
    const parsed = Number(raw.replace(/[^\d.eE+-]/g, ""));
    if (Number.isNaN(parsed)) return;
    const limits = targetType ? TYPE_LIMITS[targetType] : undefined;
    const lower = Math.max(min ?? -Infinity, limits?.min ?? -Infinity);
    const upper = Math.min(max ?? Infinity, limits?.max ?? Infinity);
    onChange?.(Math.min(upper, Math.max(lower, parsed)));
  };

  const nudge = (direction: 1 | -1) => {
    if (disabled) return;
    const base = value ?? min ?? 0;
    const next = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, base + direction * step));
    onChange?.(next);
  };

  if (variant === "Slider") {
    const low = min ?? 0;
    const high = max ?? 100;
    return (
      <div
        className={cn("inline-flex flex-col gap-1", densityText(density), className)}
        style={widgetStyle({ width, height, aspectRatio, visible, style })}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <SketchSlider
              seed={id ?? "slider"}
              value={value ?? low}
              min={low}
              max={high}
              step={step}
              disabled={disabled}
              height={byDensity(density, [18, 22, 28])}
              onChange={(next) => onChange?.(next)}
            />
            <div className="flex justify-between text-[10px] text-ink-faint">
              <span>{formatNumber(low, formatStyle, precision, currency, noGrouping)}</span>
              <span>{formatNumber(high, formatStyle, precision, currency, noGrouping)}</span>
            </div>
          </div>
          <span className="w-16 shrink-0 text-right font-bold tabular-nums">
            {value === null ? "—" : formatNumber(value, formatStyle, precision, currency, noGrouping)}
          </span>
        </div>
        {invalid && <span className="text-xs text-destructive">{invalid}</span>}
      </div>
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
      focused={focused}
      prefix={prefix}
      className={className}
      style={style}
      showClear={Boolean(nullable && value !== null)}
      onClear={() => onChange?.(null)}
      suffix={
        <>
          {suffix}
          {!hideStepper && (
            <span className="flex flex-col leading-none">
              <button
                type="button"
                aria-label="Increase"
                disabled={disabled}
                onClick={() => nudge(1)}
                className="cursor-pointer text-ink-faint hover:text-ink"
              >
                <Icon name="ChevronUp" size={iconSize - 2} />
              </button>
              <button
                type="button"
                aria-label="Decrease"
                disabled={disabled}
                onClick={() => nudge(-1)}
                className="cursor-pointer text-ink-faint hover:text-ink"
              >
                <Icon name="ChevronDown" size={iconSize - 2} />
              </button>
            </span>
          )}
        </>
      }
      {...rest}
    >
      <input
        id={id}
        inputMode="decimal"
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={Boolean(invalid) || undefined}
        className={cn(nativeInputClass, "tabular-nums")}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          setFocused(false);
          commit(event.target.value);
          onBlur?.();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          }
          if (event.key === "Enter") commit((event.target as HTMLInputElement).value);
        }}
        style={{ color: invalid ? resolveColor("Destructive") : undefined }}
      />
    </InputShell>
  );
};

export interface NumberRangeInputProps extends BaseInputProps {
  lowerValue?: number | null;
  upperValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  formatStyle?: FormatStyle;
  currency?: string;
  noGrouping?: boolean;
  targetType?: string;
  onChange?: (lower: number | null, upper: number | null) => void;
}

/** Two bounded values in one control. Mirrors `Ivy.NumberRangeInput`. */
export const NumberRangeInput = ({
  id,
  lowerValue = null,
  upperValue = null,
  min = 0,
  max = 100,
  step = 1,
  precision,
  formatStyle = "Decimal",
  currency,
  noGrouping,
  targetType,
  disabled,
  invalid,
  nullable,
  density = "Medium",
  width = "20rem",
  height,
  aspectRatio,
  visible,
  className,
  style,
  onChange,
}: NumberRangeInputProps) => {
  const lower = lowerValue ?? min;
  const upper = upperValue ?? max;

  return (
    <div
      id={id}
      className={cn("inline-flex flex-col gap-2", densityText(density), className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <div className="flex items-center gap-2">
        <NumberInput
          id={id ? `${id}-lower` : undefined}
          value={lowerValue}
          min={min}
          max={upper}
          step={step}
          precision={precision}
          formatStyle={formatStyle}
          currency={currency}
          noGrouping={noGrouping}
          targetType={targetType}
          nullable={nullable}
          disabled={disabled}
          density={density}
          width="100%"
          hideStepper
          onChange={(next) => onChange?.(next, upperValue)}
        />
        <span className="shrink-0 text-ink-faint">–</span>
        <NumberInput
          id={id ? `${id}-upper` : undefined}
          value={upperValue}
          min={lower}
          max={max}
          step={step}
          precision={precision}
          formatStyle={formatStyle}
          currency={currency}
          noGrouping={noGrouping}
          targetType={targetType}
          nullable={nullable}
          disabled={disabled}
          density={density}
          width="100%"
          hideStepper
          onChange={(next) => onChange?.(lowerValue, next)}
        />
      </div>
      <div className="flex items-center gap-2">
        <SketchSlider
          seed={`${id}-lower-slider`}
          value={lower}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(next) => onChange?.(Math.min(next, upper), upperValue)}
        />
        <SketchSlider
          seed={`${id}-upper-slider`}
          value={upper}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(next) => onChange?.(lowerValue, Math.max(next, lower))}
        />
      </div>
      {invalid && <span className="text-xs text-destructive">{invalid}</span>}
    </div>
  );
};

export { SketchSlider };
