import { byDensity, cn, densityIconSize, densityText, widgetStyle } from "@/lib/utils";
import { INK, INK_FAINT, PAPER_RAISED, STROKE, resolveColor } from "@/sketch/colors";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import type { BaseInputProps } from "./InputShell";

export type BoolInputVariant = "Checkbox" | "Switch" | "Toggle";

export type NullableBoolean = boolean | null;

export interface BoolInputProps extends BaseInputProps {
  value?: NullableBoolean;
  label?: string;
  description?: string;
  variant?: BoolInputVariant;
  loading?: boolean;
  icon?: string;
  onChange?: (value: NullableBoolean) => void;
}

/** A hand-drawn tick, in the classic wireframe style. */
const SketchTick = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
    <RoughShape
      shape={{ kind: "linearPath", points: [[3, 8], [6.5, 12], [13, 3.5]] }}
      seed="tick"
      stroke={color}
      strokeWidth={2}
      roughness={1.4}
    />
  </svg>
);

/**
 * Checkbox, switch or toggle button. Mirrors `Ivy.BoolInput`.
 *
 * @tags checkbox switch toggle boolean
 * @example <BoolInput variant="Switch" label="Notify me" value={on} onChange={setOn} />
 */
export const BoolInput = ({
  id,
  value = false,
  label,
  description,
  variant = "Checkbox",
  disabled,
  loading,
  nullable,
  invalid,
  icon,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  autoFocus,
  className,
  style,
  onChange,
}: BoolInputProps) => {
  const rootStyle = widgetStyle({ width, height, aspectRatio, visible, style });
  const iconSize = densityIconSize(density);
  const stroke = invalid ? resolveColor("Destructive") : value ? INK : INK_FAINT;

  const next = (): NullableBoolean => {
    if (!nullable) return !value;
    if (value === false) return true;
    if (value === true) return null;
    return false;
  };

  const toggle = () => {
    if (disabled || loading) return;
    onChange?.(next());
  };

  if (variant === "Toggle") {
    return (
      <SketchFrame
        as="button"
        type="button"
        id={id}
        seed={id ?? "toggle"}
        corner="rounded"
        stroke={stroke}
        fill={value ? "#e8e5db" : PAPER_RAISED}
        fillStyle="solid"
        doubleStroke={Boolean(value)}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        aria-pressed={value === true}
        onClick={toggle}
        className={cn(
          "inline-block",
          densityText(density),
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
        contentClassName={cn(
          "flex items-center gap-2",
          byDensity(density, ["px-2 py-1", "px-3 py-1.5", "px-4 py-2.5"]),
        )}
        style={rootStyle}
      >
        {loading ? (
          <Icon name="LoaderCircle" size={iconSize} className="animate-spin" />
        ) : (
          icon && <Icon name={icon} size={iconSize} />
        )}
        {label && (
          <span className={cn("steady-bold", value && "font-bold")} data-label={label}>
            <span>{label}</span>
          </span>
        )}
      </SketchFrame>
    );
  }

  if (variant === "Switch") {
    const trackWidth = byDensity(density, [32, 40, 48]);
    const trackHeight = byDensity(density, [16, 20, 26]);
    const knob = trackHeight - 6;

    return (
      <label
        className={cn(
          "inline-flex items-start gap-2",
          densityText(density),
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
        style={rootStyle}
      >
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={value === true}
          disabled={disabled || loading}
          autoFocus={autoFocus}
          onClick={toggle}
          className="relative shrink-0"
          style={{ width: trackWidth, height: trackHeight }}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-0 overflow-visible"
            width={trackWidth}
            height={trackHeight}
          >
            <RoughShape
              shape={{
                kind: "path",
                d: `M ${trackHeight / 2} 1 H ${trackWidth - trackHeight / 2} A ${trackHeight / 2 - 1} ${trackHeight / 2 - 1} 0 0 1 ${trackWidth - trackHeight / 2} ${trackHeight - 1} H ${trackHeight / 2} A ${trackHeight / 2 - 1} ${trackHeight / 2 - 1} 0 0 1 ${trackHeight / 2} 1 Z`,
              }}
              seed={`${id}-track`}
              stroke={stroke}
              strokeWidth={STROKE.regular}
              fill={value ? "#e8e5db" : undefined}
              fillStyle="solid"
            />
            <RoughShape
              shape={{
                kind: "circle",
                cx: value ? trackWidth - trackHeight / 2 : trackHeight / 2,
                cy: trackHeight / 2,
                diameter: knob,
              }}
              seed={`${id}-knob`}
              stroke={value ? INK : INK_FAINT}
              strokeWidth={STROKE.regular}
              fill={value ? INK : PAPER_RAISED}
              fillStyle="solid"
            />
          </svg>
        </button>
        {(label || description) && (
          <span className="block">
            {label && <span className="block leading-tight">{label}</span>}
            {description && <span className="block text-xs text-ink-muted">{description}</span>}
          </span>
        )}
      </label>
    );
  }

  const boxSize = byDensity(density, [14, 18, 22]);

  return (
    <label
      className={cn(
        "inline-flex items-start gap-2",
        densityText(density),
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
      style={rootStyle}
    >
      <SketchFrame
        as="button"
        type="button"
        id={id}
        seed={id ?? "checkbox"}
        corner="rounded"
        stroke={stroke}
        fill={PAPER_RAISED}
        fillStyle="solid"
        strokeWidth={STROKE.regular}
        role="checkbox"
        aria-checked={value === null ? "mixed" : value === true}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        onClick={toggle}
        className="shrink-0"
        contentClassName="flex h-full w-full items-center justify-center"
        style={{ width: boxSize, height: boxSize, marginTop: 1 }}
      >
        {loading ? (
          <Icon name="LoaderCircle" size={boxSize - 6} className="animate-spin" />
        ) : value === true ? (
          <SketchTick size={boxSize - 4} color={INK} />
        ) : value === null ? (
          <Icon name="Minus" size={boxSize - 6} color={INK_FAINT} />
        ) : null}
      </SketchFrame>
      {(label || description) && (
        <span className="block">
          {label && <span className="block leading-tight">{label}</span>}
          {description && <span className="block text-xs text-ink-muted">{description}</span>}
          {invalid && <span className="block text-xs text-destructive">{invalid}</span>}
        </span>
      )}
    </label>
  );
};
