import * as React from "react";
import { cn, sizeStyle } from "@/lib/utils";
import type { Sizing, WidgetBaseProps } from "@/lib/types";
import { resolveColor, tint } from "@/sketch/colors";
import { RoughShape } from "@/sketch/RoughShape";
import { SketchFrame } from "@/sketch/SketchFrame";
import { useMeasuredSize } from "@/sketch/useRough";

export interface WireframeNoteProps extends WidgetBaseProps {
  text?: string;
  color?: string;
  width?: Sizing;
  height?: Sizing;
  children?: React.ReactNode;
}

/** A sticky note pinned to the wireframe. Mirrors `Ivy.WireframeNote`. */
export const WireframeNote = ({
  id,
  text,
  color = "Amber",
  width = "12rem",
  height,
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
      strokeWidth={1.2}
      fill={tint(accent, 0.82)}
      fillStyle="solid"
      className={cn("inline-block rotate-[-1.2deg] shadow-[2px_3px_0_0_rgba(47,47,47,0.12)]", className)}
      contentClassName="block p-3 text-sm leading-snug"
      style={{ ...sizeStyle(width, height), ...style }}
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

/** A numbered marker for annotating a wireframe. Mirrors `Ivy.WireframeCallout`. */
export const WireframeCallout = ({
  id,
  label = "1",
  color = "Destructive",
  leader,
  children,
  className,
  style,
}: WireframeCalloutProps) => {
  const accent = resolveColor(color);
  const { ref, width } = useMeasuredSize<HTMLSpanElement>();

  return (
    <span
      id={id}
      className={cn("inline-flex items-center gap-2 align-middle", className)}
      style={style}
    >
      <SketchFrame
        seed={id ?? `callout-${label}`}
        corner="ellipse"
        stroke={accent}
        strokeWidth={1.5}
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
          {width > 0 && (
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
              <RoughShape
                shape={{ kind: "line", x1: 0, y1: 1, x2: width, y2: 1 }}
                seed={`${id}-leader`}
                stroke={accent}
                strokeWidth={1.2}
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
  repeat?: number | null;
  repeatDelay?: number;
  visible?: boolean;
  intensity?: number;
  trigger?: "Auto" | "Click" | "Hover";
  children?: React.ReactNode;
}

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
  repeat = 0,
  repeatDelay = 0,
  visible = true,
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

  if (!visible) return null;

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
        animationDelay: `${delay}s`,
        animationIterationCount: repeat === null ? "infinite" : repeat + 1,
        animationFillMode: "both",
        animationTimingFunction: "ease-in-out",
        ...(repeatDelay ? { animationDelay: `${delay + repeatDelay}s` } : {}),
        ...style,
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
      style={style}
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
