import * as React from "react";
import { cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { STROKE, resolveColor, tint } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

export interface WireframeNoteProps extends WidgetBaseProps {
  text?: string;
  color?: string;
  children?: React.ReactNode;
}

/**
 * A sticky note pinned to the wireframe. Mirrors `Ivy.WireframeNote`.
 *
 * @tags annotation sticky comment
 * @example <WireframeNote text="Copy still to be written." />
 */
export const WireframeNote = ({
  id,
  text,
  color = "Amber",
  width = "12rem",
  height,
  aspectRatio,
  visible,
  children,
  className,
  style,
}: WireframeNoteProps) => {
  const accent = resolveColor(color);

  return (
    <SketchFrame
      id={id}
      seed={id ?? text ?? "note"}
      corner="sharp"
      stroke={accent}
      strokeWidth={STROKE.regular}
      fill={tint(accent, 0.82)}
      fillStyle="solid"
      className={cn("inline-block rotate-[-1.2deg] shadow-[2px_3px_0_0_rgba(47,47,47,0.12)]", className)}
      contentClassName="block p-3 text-sm leading-snug"
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      {children ?? text}
    </SketchFrame>
  );
};

export interface WireframeCalloutProps extends WidgetBaseProps {
  /** Short marker text, e.g. `"1"` or `"A"`. */
  label?: string;
  color?: string;
  /** Draws a leader line pointing this many pixels to the right. */
  leader?: number;
  children?: React.ReactNode;
}

/**
 * A numbered marker for annotating a wireframe. Mirrors `Ivy.WireframeCallout`.
 *
 * @tags annotation marker numbered
 * @example <WireframeCallout label="1" leader={60}>Primary action</WireframeCallout>
 */
export const WireframeCallout = ({
  id,
  label = "1",
  color = "Destructive",
  leader,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeCalloutProps) => {
  const accent = resolveColor(color);
  const { ref, width: leaderWidth } = useMeasuredSize<HTMLSpanElement>();

  return (
    <span
      id={id}
      className={cn("inline-flex items-center gap-2 align-middle", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
    >
      <SketchFrame
        seed={id ?? `callout-${label}`}
        corner="ellipse"
        stroke={accent}
        strokeWidth={STROKE.emphasis}
        fill={tint(accent, 0.85)}
        fillStyle="solid"
        className="inline-block shrink-0"
        contentClassName="flex h-full w-full items-center justify-center"
        style={{ width: 24, height: 24 }}
      >
        <span className="text-xs font-bold" style={{ color: accent }}>
          {label}
        </span>
      </SketchFrame>
      {leader ? (
        <span ref={ref} className="relative inline-block h-[3px]" style={{ width: leader }}>
          {leaderWidth > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
              <RoughShape
                shape={{ kind: "line", x1: 0, y1: 1, x2: leaderWidth, y2: 1 }}
                seed={`${id}-leader`}
                stroke={accent}
                strokeWidth={STROKE.regular}
                roughness={1.6}
              />
            </svg>
          )}
        </span>
      ) : null}
      {children && <span className="text-sm" style={{ color: accent }}>{children}</span>}
    </span>
  );
};

export type AnimationType =
  | "Rotate"
  | "SlideIn"
  | "FadeIn"
  | "ZoomIn"
  | "SlideOut"
  | "FadeOut"
  | "ZoomOut"
  | "Bounce"
  | "Shake"
  | "Flip"
  | "Stagger"
  | "Wave"
  | "Pulse"
  | "Spring"
  | "Hover";

export interface AnimationProps extends WidgetBaseProps {
  type?: AnimationType;
  duration?: number;
  delay?: number;
  direction?: "Left" | "Right" | "Up" | "Down";
  distance?: number;
  easing?: AnimationEasing;
  repeat?: number | null;
  repeatDelay?: number;
  intensity?: number;
  trigger?: "Auto" | "Click" | "Hover";
  children?: React.ReactNode;
}

export type AnimationEasing =
  | "EaseIn"
  | "EaseOut"
  | "EaseInOut"
  | "Linear"
  | "CircIn"
  | "CircOut"
  | "CircInOut"
  | "BackIn"
  | "BackOut"
  | "BackInOut"
  | "Anticipate"
  | "AnticipateOut"
  | "BounceIn"
  | "BounceOut"
  | "BounceInOut"
  | "ElasticIn"
  | "ElasticOut"
  | "ElasticInOut";

/** Ivy's easing enum, mapped onto CSS timing functions. */
const EASING: Record<AnimationEasing, string> = {
  Linear: "linear",
  EaseIn: "ease-in",
  EaseOut: "ease-out",
  EaseInOut: "ease-in-out",
  CircIn: "cubic-bezier(0.55, 0, 1, 0.45)",
  CircOut: "cubic-bezier(0, 0.55, 0.45, 1)",
  CircInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
  BackIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
  BackOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  BackInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
  Anticipate: "cubic-bezier(0.5, -0.5, 0.2, 1.2)",
  AnticipateOut: "cubic-bezier(0.8, -0.2, 0.5, 1.5)",
  BounceIn: "cubic-bezier(0.7, -0.4, 0.9, 0.2)",
  BounceOut: "cubic-bezier(0.1, 0.8, 0.3, 1.4)",
  BounceInOut: "cubic-bezier(0.8, -0.4, 0.2, 1.4)",
  ElasticIn: "cubic-bezier(0.7, -0.6, 0.9, 0.4)",
  ElasticOut: "cubic-bezier(0.1, 1.6, 0.3, 1)",
  ElasticInOut: "cubic-bezier(0.9, -0.6, 0.1, 1.6)",
};

const DIRECTION_SIGN: Record<NonNullable<AnimationProps["direction"]>, number> = {
  Left: -1,
  Up: -1,
  Right: 1,
  Down: 1,
};

const KEYFRAMES: Record<AnimationType, string> = {
  Rotate: "tendril-rotate",
  SlideIn: "tendril-slide-in",
  FadeIn: "tendril-fade-in",
  ZoomIn: "tendril-zoom-in",
  SlideOut: "tendril-slide-out",
  FadeOut: "tendril-fade-out",
  ZoomOut: "tendril-zoom-out",
  Bounce: "tendril-bounce",
  Shake: "tendril-shake",
  Flip: "tendril-flip",
  Stagger: "tendril-fade-in",
  Wave: "tendril-wave",
  Pulse: "tendril-pulse",
  Spring: "tendril-bounce",
  Hover: "tendril-jitter",
};

/**
 * Wraps children in a CSS animation. Mirrors `Ivy.Animation`; the easing enum
 * maps onto CSS timing functions rather than a physics engine.
 */
export const Animation = ({
  id,
  type = "FadeIn",
  duration = 0.6,
  delay = 0,
  easing = "Linear",
  repeat = 0,
  repeatDelay = 0,
  direction,
  distance,
  intensity = 1,
  visible = true,
  width,
  height,
  aspectRatio,
  trigger = "Auto",
  children,
  className,
  style,
}: AnimationProps) => {
  const [playing, setPlaying] = React.useState(trigger === "Auto");
  const [pulse, setPulse] = React.useState(0);

  const play = () => {
    setPulse((count) => count + 1);
    setPlaying(true);
  };

  return (
    <span
      id={id}
      key={pulse}
      onClick={trigger === "Click" ? play : undefined}
      onMouseEnter={trigger === "Hover" ? play : undefined}
      className={cn("inline-block", trigger !== "Auto" && "cursor-pointer", className)}
      style={{
        animationName: playing ? KEYFRAMES[type] : undefined,
        animationDuration: `${duration}s`,
        animationDelay: `${delay + repeatDelay}s`,
        animationIterationCount: repeat === null ? "infinite" : repeat + 1,
        animationFillMode: "both",
        animationTimingFunction: EASING[easing],
        // Ivy scales SlideIn/SlideOut by direction and distance, and every
        // animation by intensity; both ride along as custom properties.
        ["--tendril-distance" as string]: `${(distance ?? 100) * intensity * DIRECTION_SIGN[direction ?? "Left"]}px`,
        ["--tendril-intensity" as string]: intensity,
        ...widgetStyle({ width, height, aspectRatio, visible, style }),
      }}
    >
      {children}
    </span>
  );
};

export interface ConfettiProps extends WidgetBaseProps {
  trigger?: "Auto" | "Click" | "Hover";
  /** Number of scraps thrown. */
  count?: number;
  children?: React.ReactNode;
}

const CONFETTI_COLORS = ["Red", "Amber", "Green", "Blue", "Violet", "Pink"];

/** Hand-torn paper confetti. Mirrors `Ivy.Confetti`. */
export const Confetti = ({
  id,
  trigger = "Auto",
  count = 24,
  children,
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: ConfettiProps) => {
  const [burst, setBurst] = React.useState(trigger === "Auto" ? 1 : 0);

  const scraps = React.useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: (index / count) * 100 + (index % 3) * 2,
        color: resolveColor(CONFETTI_COLORS[index % CONFETTI_COLORS.length]),
        delay: (index % 7) * 0.08,
        rotate: (index % 5) * 40,
      })),
    [count],
  );

  return (
    <span
      id={id}
      className={cn("relative inline-block", trigger !== "Auto" && "cursor-pointer", className)}
      style={widgetStyle({ width, height, aspectRatio, visible, style })}
      onClick={trigger === "Click" ? () => setBurst((value) => value + 1) : undefined}
      onMouseEnter={trigger === "Hover" ? () => setBurst((value) => value + 1) : undefined}
    >
      {children}
      {burst > 0 && (
        <span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
          {scraps.map((scrap, index) => (
            <span
              key={index}
              className="absolute top-0 block h-2 w-1.5"
              style={{
                left: `${scrap.left}%`,
                background: scrap.color,
                borderRadius: "30% 60% 40% 55%",
                transform: `rotate(${scrap.rotate}deg)`,
                animation: `tendril-confetti 1.1s ease-out ${scrap.delay}s both`,
              }}
            />
          ))}
        </span>
      )}
    </span>
  );
};
