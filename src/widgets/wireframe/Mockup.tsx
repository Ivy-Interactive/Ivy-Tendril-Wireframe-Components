import * as React from "react";
import { byDensity, cn, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";
import { roundedRectPath } from "@/sketch/hand";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

export type MockupVariant = "Mobile" | "Website" | "Tablet" | "Desktop";

/** Sizes a frame falls back to, so a bare mockup still looks like its device. */
const DEFAULT_SIZE: Record<MockupVariant, [number, number]> = {
  Mobile: [75, 150],
  Tablet: [130, 175],
  Desktop: [165, 125],
  Website: [165, 115],
};

type Rect = { x: number; y: number; w: number; h: number };

type Stroke = { path: string; strokeWidth: number } | { line: [number, number, number, number]; strokeWidth: number };

interface Frame {
  strokes: Stroke[];
  /** Where children are laid out — the screen, inside whatever chrome there is. */
  screen: Rect;
  titleBar?: Rect;
  addressBar?: Rect;
}

const box = (x: number, y: number, w: number, h: number, radius: number, strokeWidth: number): Stroke => ({
  path: roundedRectPath(x, y, w, h, radius),
  strokeWidth,
});

const line = (x1: number, y1: number, x2: number, y2: number, strokeWidth: number): Stroke => ({
  line: [x1, y1, x2, y2],
  strokeWidth,
});

function buildFrame(variant: MockupVariant, w: number, h: number, sw: number): Frame | null {
  const strokes: Stroke[] = [];
  // The shell is drawn heavier than everything inside it, the way a hand bears
  // down on the outline and eases off for the detail.
  const body = sw * 1.4;
  const pad = body;
  const bw = w - pad * 2;
  const bh = h - pad * 2;

  if (variant === "Mobile" || variant === "Tablet") {
    const isPhone = variant === "Mobile";
    const side = isPhone ? 9 : 14;
    const top = isPhone ? 30 : 26;
    const bottom = 26;
    const radius = isPhone ? Math.min(w, h) * 0.09 : 20;
    if (bw < side * 2 + 40 || bh < top + bottom + 40) return null;

    strokes.push(box(pad, pad, bw, bh, radius, body));

    const screen: Rect = {
      x: pad + side,
      y: pad + top,
      w: bw - side * 2,
      h: bh - top - bottom,
    };
    strokes.push(box(screen.x, screen.y, screen.w, screen.h, Math.max(3, radius - side), sw));

    const bezel = pad + top / 2;
    if (isPhone) {
      // Speaker slot and camera in the top bezel, home indicator at the foot,
      // and the buttons down the sides.
      const pillW = bw * 0.2;
      const pillX = pad + bw / 2 - pillW / 2 - 6;
      strokes.push(box(pillX, bezel - 2.5, pillW, 5, 2.5, sw * 0.8));
      strokes.push(box(pillX + pillW + 8, bezel - 3.5, 7, 7, 3.5, sw * 0.8));
      const indicator = bw * 0.3;
      strokes.push(
        line(
          pad + bw / 2 - indicator / 2,
          pad + bh - bottom / 2,
          pad + bw / 2 + indicator / 2,
          pad + bh - bottom / 2,
          sw * 1.2,
        ),
      );
      strokes.push(line(pad, pad + bh * 0.24, pad, pad + bh * 0.32, body));
      strokes.push(line(pad, pad + bh * 0.37, pad, pad + bh * 0.47, body));
      strokes.push(line(pad + bw, pad + bh * 0.28, pad + bw, pad + bh * 0.4, body));
    } else {
      strokes.push(box(pad + bw / 2 - 3.5, bezel - 3.5, 7, 7, 3.5, sw * 0.8));
    }

    return { strokes, screen };
  }

  if (variant === "Desktop") {
    // An application window: rounded shell, title bar with traffic lights, and
    // the content directly under it. No bezel and no stand — this is the
    // window, not the machine it is displayed on.
    const barH = 32;
    if (bw < 160 || bh < barH + 40) return null;

    strokes.push(box(pad, pad, bw, bh, 11, body));

    const lightY = pad + barH / 2;
    const lightR = 5.5;
    for (let i = 0; i < 3; i++) {
      const lx = pad + 16 + i * 17;
      strokes.push(box(lx - lightR, lightY - lightR, lightR * 2, lightR * 2, lightR, sw * 0.9));
    }
    strokes.push(line(pad, pad + barH, pad + bw, pad + barH, sw));

    return {
      strokes,
      screen: { x: pad + 1, y: pad + barH + 1, w: bw - 2, h: bh - barH - 2 },
      titleBar: { x: pad, y: pad, w: bw, h: barH },
    };
  }

  // Website: a browser window — toolbar with nav glyphs and an address pill.
  const barH = 38;
  if (bw < 160 || bh < barH + 40) return null;

  strokes.push(box(pad, pad, bw, bh, 8, body));
  strokes.push(line(pad, pad + barH, pad + bw, pad + barH, sw));

  const gy = pad + barH / 2;
  const chevron = (gx: number, facing: number) => {
    strokes.push(line(gx - 5 * facing, gy, gx + 5 * facing, gy, sw));
    strokes.push(line(gx + 5 * facing, gy, gx + facing, gy - 4, sw));
    strokes.push(line(gx + 5 * facing, gy, gx + facing, gy + 4, sw));
  };
  chevron(pad + 22, -1);
  chevron(pad + 48, 1);
  strokes.push(box(pad + 69, gy - 5, 10, 10, 5, sw));

  const pillX = pad + 92;
  const pillW = bw - 92 - 16;
  const pillH = 22;
  const addressBar: Rect = { x: pillX, y: gy - pillH / 2, w: pillW, h: pillH };
  strokes.push(box(addressBar.x, addressBar.y, addressBar.w, addressBar.h, pillH / 2, sw));

  return {
    strokes,
    screen: { x: pad + 1, y: pad + barH + 1, w: bw - 2, h: bh - barH - 2 },
    addressBar,
  };
}

export interface WireframeMockupProps extends WidgetBaseProps {
  variant?: MockupVariant;
  color?: string;
  /** Window title on the `Desktop` variant. Ignored by the other variants. */
  title?: string;
  /** Address bar text on the `Website` variant. Ignored by the other variants. */
  url?: string;
  /** Laid out inside the frame's screen area, so a mockup can hold anything. */
  children?: React.ReactNode;
}

/**
 * A hand-drawn device or browser frame wrapped around real content.
 * Mirrors `Ivy.WireframeMockup`.
 *
 * @tags device phone browser frame chrome
 * @slot children Laid out inside the frame's screen area
 * @example <WireframeMockup variant="Mobile"><Card title="Inbox" /></WireframeMockup>
 * @example <WireframeMockup variant="Website" url="app.example.com" width="42rem" />
 */
export const WireframeMockup = ({
  id,
  variant = "Mobile",
  color = "Black",
  title,
  url,
  children,
  density = "Medium",
  width,
  height,
  aspectRatio,
  visible,
  className,
  style,
}: WireframeMockupProps) => {
  const accent = resolveColor(color);
  const { ref, width: w, height: h } = useMeasuredSize<HTMLDivElement>();
  const strokeWidth = byDensity(density, [1.4, 1.8, 2.4]);
  const chromeText = byDensity(density, ["text-[10px]", "text-[11px]", "text-[13px]"]);

  const frame = React.useMemo(
    () => (w > 0 && h > 0 ? buildFrame(variant, w, h, strokeWidth) : null),
    [w, h, variant, strokeWidth],
  );

  const [defaultWidth, defaultHeight] = DEFAULT_SIZE[variant];

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={widgetStyle({
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        aspectRatio,
        visible,
        style,
      })}
    >
      {frame && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {frame.strokes.map((stroke, index) => (
            <RoughShape
              key={index}
              shape={
                "path" in stroke
                  ? { kind: "path", d: stroke.path }
                  : {
                      kind: "line",
                      x1: stroke.line[0],
                      y1: stroke.line[1],
                      x2: stroke.line[2],
                      y2: stroke.line[3],
                    }
              }
              seed={`${id}-frame-${index}`}
              stroke={accent}
              strokeWidth={stroke.strokeWidth}
            />
          ))}
        </svg>
      )}

      {frame?.titleBar && title && (
        <span
          className={cn(
            "absolute flex items-center justify-center overflow-hidden font-bold text-ellipsis whitespace-nowrap select-none",
            chromeText,
          )}
          style={{
            // Kept clear of the traffic lights on the left and of the space
            // their mirror would occupy on the right, so the title stays centred.
            left: frame.titleBar.x + 70,
            top: frame.titleBar.y,
            width: Math.max(0, frame.titleBar.w - 140),
            height: frame.titleBar.h,
            color: accent,
          }}
        >
          {title}
        </span>
      )}

      {frame?.addressBar && url && (
        <span
          className={cn(
            "absolute flex items-center overflow-hidden pl-3 text-ellipsis whitespace-nowrap opacity-75 select-none",
            chromeText,
          )}
          style={{
            left: frame.addressBar.x,
            top: frame.addressBar.y,
            width: frame.addressBar.w,
            height: frame.addressBar.h,
            color: accent,
          }}
        >
          {url}
        </span>
      )}

      {frame && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: frame.screen.x,
            top: frame.screen.y,
            width: frame.screen.w,
            height: frame.screen.h,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
