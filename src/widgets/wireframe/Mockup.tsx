import * as React from "react";
import { byDensity, cn, toCssSize, widgetStyle } from "@/lib/utils";
import type { WidgetBaseProps } from "@/lib/types";
import { resolveColor } from "@/sketch/colors";
import { handRng, roundedRectPath, type Pt } from "@/sketch/hand";
import { Icon } from "@/sketch/Icon";
import { RoughShape } from "@/sketch/RoughShape";
import { useMeasuredSize } from "@/sketch/useRough";

/**
 * Which frame to draw.
 *
 * `OSX` and `Windows` are separate on purpose. They were one `Desktop` variant drawing
 * macOS traffic lights, which is actively misleading on a wireframe of a Windows
 * application — the platform is usually the first thing a reviewer reads off a window
 * sketch, and there was no way to say "Windows" at all.
 */
export type MockupVariant =
  /** A phone: bezel, speaker slot, side buttons, home indicator. */
  | "Mobile"
  /** A tablet: thinner bezel, a camera, no side buttons. */
  | "Tablet"
  /** A browser window: toolbar, nav glyphs, address pill. */
  | "Website"
  /** A macOS application window: traffic lights left, title centred. */
  | "OSX"
  /** A Windows application window: app icon and title left, caption buttons right. */
  | "Windows";

/** Sizes a frame falls back to, so a bare mockup still looks like its device. */
const DEFAULT_SIZE: Record<MockupVariant, [number, number]> = {
  Mobile: [75, 150],
  Tablet: [130, 175],
  Website: [165, 115],
  OSX: [165, 125],
  Windows: [165, 125],
};

/** Chrome row heights, in pixels. Constant so a frame is predictable at any density. */
const TITLE_BAR = 32;
const MENU_BAR = 24;
const FOOTER_BAR = 26;
/** Room the three Windows caption buttons need on the right of the title bar. */
const CAPTIONS = 92;

type Rect = { x: number; y: number; w: number; h: number };

type Stroke =
  | { path: string; strokeWidth: number }
  | { line: [number, number, number, number]; strokeWidth: number };

interface Frame {
  strokes: Stroke[];
  /** Where children are laid out — the screen, inside whatever chrome there is. */
  screen: Rect;
  titleBar?: Rect;
  /** Windows puts its title next to the icon; macOS centres it. */
  titleAlign?: "left" | "center";
  iconBox?: Rect;
  menuBar?: Rect;
  footerBar?: Rect;
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

/** Space the chrome takes on each edge, so the content can be laid out inside it. */
interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Which optional rows of chrome a mockup was given. */
export interface MockupRows {
  menu?: boolean;
  footer?: boolean;
}

/**
 * How much room the chrome needs, before anything has been measured.
 *
 * The frame is drawn from the measured box, but the content has to be laid out *inside* the
 * chrome for the mockup to grow with it — which means knowing the insets first. They depend
 * only on the variant, the pencil weight and which rows are present, so this is a pure
 * function and the two can never disagree.
 */
export function mockupInsets(variant: MockupVariant, sw: number, rows: MockupRows = {}): Insets {
  const pad = sw * 1.4;

  if (variant === "Mobile" || variant === "Tablet") {
    const isPhone = variant === "Mobile";
    const side = isPhone ? 9 : 14;
    return {
      left: pad + side,
      right: pad + side,
      top: pad + (isPhone ? 30 : 26) + (rows.menu ? MENU_BAR : 0),
      bottom: pad + 26 + (rows.footer ? FOOTER_BAR : 0),
    };
  }

  const barH = variant === "Website" ? 38 : TITLE_BAR;
  return {
    left: pad + 1,
    right: pad + 1,
    top: pad + barH + 1 + (rows.menu ? MENU_BAR : 0),
    bottom: pad + 1 + (rows.footer ? FOOTER_BAR : 0),
  };
}

/** The three Windows caption glyphs: minimise, maximise, close. */
function captionGlyphs(strokes: Stroke[], bar: Rect, sw: number) {
  const cy = bar.y + bar.h / 2;
  const step = 30;
  const first = bar.x + bar.w - CAPTIONS + 16;

  // Minimise: a single rule.
  strokes.push(line(first - 5, cy, first + 5, cy, sw));

  // Maximise: a small square.
  const s = 9;
  strokes.push(box(first + step - s / 2, cy - s / 2, s, s, 1, sw));

  // Close: a cross.
  const c = first + step * 2;
  strokes.push(line(c - 5, cy - 5, c + 5, cy + 5, sw));
  strokes.push(line(c + 5, cy - 5, c - 5, cy + 5, sw));
}

function buildFrame(
  variant: MockupVariant,
  w: number,
  h: number,
  sw: number,
  rows: MockupRows,
): Frame | null {
  const strokes: Stroke[] = [];
  // The shell is drawn heavier than everything inside it, the way a hand bears
  // down on the outline and eases off for the detail.
  const body = sw * 1.4;
  const pad = body;
  const bw = w - pad * 2;
  const bh = h - pad * 2;

  const menuH = rows.menu ? MENU_BAR : 0;
  const footerH = rows.footer ? FOOTER_BAR : 0;

  if (variant === "Mobile" || variant === "Tablet") {
    const isPhone = variant === "Mobile";
    const side = isPhone ? 9 : 14;
    const top = isPhone ? 30 : 26;
    const bottom = 26;
    const radius = isPhone ? Math.min(w, h) * 0.09 : 20;
    if (bw < side * 2 + 40 || bh < top + bottom + 40) return null;

    strokes.push(box(pad, pad, bw, bh, radius, body));

    const glass: Rect = {
      x: pad + side,
      y: pad + top,
      w: bw - side * 2,
      h: bh - top - bottom,
    };
    strokes.push(box(glass.x, glass.y, glass.w, glass.h, Math.max(3, radius - side), sw));

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

    // An app bar and a tab bar, inside the glass rather than part of the device.
    const menuBar = menuH ? { x: glass.x, y: glass.y, w: glass.w, h: menuH } : undefined;
    if (menuBar) strokes.push(line(menuBar.x, menuBar.y + menuH, menuBar.x + menuBar.w, menuBar.y + menuH, sw));

    const footerBar = footerH
      ? { x: glass.x, y: glass.y + glass.h - footerH, w: glass.w, h: footerH }
      : undefined;
    if (footerBar) strokes.push(line(footerBar.x, footerBar.y, footerBar.x + footerBar.w, footerBar.y, sw));

    return {
      strokes,
      screen: { x: glass.x, y: glass.y + menuH, w: glass.w, h: glass.h - menuH - footerH },
      menuBar,
      footerBar,
    };
  }

  if (variant === "OSX" || variant === "Windows") {
    const isMac = variant === "OSX";
    if (bw < 200 || bh < TITLE_BAR + menuH + footerH + 40) return null;

    // macOS windows are softly rounded; Windows 11 is rounded but tighter.
    strokes.push(box(pad, pad, bw, bh, isMac ? 11 : 7, body));

    const titleBar: Rect = { x: pad, y: pad, w: bw, h: TITLE_BAR };
    const cy = pad + TITLE_BAR / 2;

    let iconBox: Rect | undefined;
    if (isMac) {
      // Traffic lights, left.
      const r = 5.5;
      for (let i = 0; i < 3; i++) {
        const lx = pad + 16 + i * 17;
        strokes.push(box(lx - r, cy - r, r * 2, r * 2, r, sw * 0.9));
      }
    } else {
      captionGlyphs(strokes, titleBar, sw);
      iconBox = { x: pad + 10, y: cy - 8, w: 16, h: 16 };
    }

    strokes.push(line(pad, pad + TITLE_BAR, pad + bw, pad + TITLE_BAR, sw));

    const menuBar = menuH
      ? { x: pad, y: pad + TITLE_BAR, w: bw, h: menuH }
      : undefined;
    if (menuBar) {
      strokes.push(line(pad, menuBar.y + menuH, pad + bw, menuBar.y + menuH, sw));
    }

    const footerBar = footerH
      ? { x: pad, y: pad + bh - footerH, w: bw, h: footerH }
      : undefined;
    if (footerBar) {
      strokes.push(line(pad, footerBar.y, pad + bw, footerBar.y, sw));
    }

    return {
      strokes,
      screen: {
        x: pad + 1,
        y: pad + TITLE_BAR + menuH + 1,
        w: bw - 2,
        h: bh - TITLE_BAR - menuH - footerH - 2,
      },
      titleBar,
      titleAlign: isMac ? "center" : "left",
      iconBox,
      menuBar,
      footerBar,
    };
  }

  // Website: a browser window — toolbar with nav glyphs and an address pill.
  const barH = 38;
  if (bw < 200 || bh < barH + menuH + footerH + 40) return null;

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

  const menuBar = menuH ? { x: pad, y: pad + barH, w: bw, h: menuH } : undefined;
  if (menuBar) strokes.push(line(pad, menuBar.y + menuH, pad + bw, menuBar.y + menuH, sw));

  const footerBar = footerH ? { x: pad, y: pad + bh - footerH, w: bw, h: footerH } : undefined;
  if (footerBar) strokes.push(line(pad, footerBar.y, pad + bw, footerBar.y, sw));

  return {
    strokes,
    screen: {
      x: pad + 1,
      y: pad + barH + menuH + 1,
      w: bw - 2,
      h: bh - barH - menuH - footerH - 2,
    },
    addressBar,
    // The favicon sits in the pill, where a browser puts it.
    iconBox: { x: addressBar.x + 7, y: gy - 7, w: 14, h: 14 },
    menuBar,
    footerBar,
  };
}

/**
 * A ragged line across the foot of the screen, for content that was cut off.
 *
 * Drawn rather than faded alone, because a fade can read as a design choice; a torn edge
 * reads as "this is not all of it", which is the honest signal when a mockup has been given
 * less room than its content needs.
 */
function tearPoints(screen: Rect, seed: string): Pt[] {
  const rnd = handRng(seed);
  const y = screen.y + screen.h - 5;
  const steps = Math.max(6, Math.round(screen.w / 18));

  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = screen.x + (screen.w * i) / steps;
    // Alternating peaks, jittered, so it reads as torn paper rather than a sawtooth.
    const lift = (i % 2 === 0 ? -1 : 1) * (2.2 + rnd() * 2.6);
    return [x, y + lift] as Pt;
  });
}

export interface WireframeMockupProps extends WidgetBaseProps {
  variant?: MockupVariant;
  color?: string;
  /**
   * Window title. Drawn left of centre on `Windows` (beside the icon) and centred on `OSX`.
   * Ignored by the device and browser variants.
   */
  title?: string;
  /**
   * Icon name from the lucide set. The app icon in a `Windows` title bar, beside the title
   * on `OSX`, and the favicon in the `Website` address pill.
   */
  icon?: string;
  /**
   * Menu bar items, drawn as a row of chrome under the title bar — `["File", "Edit", "View"]`.
   * Real chrome rather than a hand-laid row of labels inside the content.
   */
  menu?: string[];
  /** Address bar text on the `Website` variant. Ignored by the other variants. */
  url?: string;
  /**
   * A status bar along the bottom, inside the frame. Takes any node, so it can hold a row of
   * counts, a progress bar, or plain text.
   */
  footer?: React.ReactNode;
  /**
   * Laid out inside the frame's screen area, so a mockup can hold anything.
   *
   * The frame grows to fit this. It only ever clips when `height` is set, and then the cut
   * is drawn as a torn edge rather than left silent.
   */
  children?: React.ReactNode;
}

/**
 * A hand-drawn device or browser frame wrapped around real content.
 * Mirrors `Ivy.WireframeMockup`.
 *
 * **It grows to fit its children.** The variant's size is a starting point, not a limit, so
 * a long page inside a `Website` frame makes the frame taller rather than being cut off at
 * the bottom of a notional screen.
 *
 * **Set `height` only when the frame's size is the point** — showing that content overflows
 * a phone, or lining two mockups up. Content that then does not fit is clipped, and the clip
 * is drawn as a torn edge across the foot of the screen, because a mockup that silently
 * loses half its content is worse than one that admits it.
 *
 * `OSX` and `Windows` draw their own platform's chrome: traffic lights and a centred title
 * for one, an app icon, a left title and caption buttons for the other. `title`, `icon`,
 * `menu` and `footer` build the rest of the window.
 *
 * @tags device phone browser frame chrome window desktop
 * @slot children Laid out inside the frame's screen area; the frame grows to fit them
 * @slot footer A status bar along the bottom, inside the frame
 * @example <WireframeMockup variant="Mobile"><Card title="Inbox" /></WireframeMockup>
 * @example <WireframeMockup variant="Website" url="app.example.com" icon="Globe" />
 * @example <WireframeMockup variant="Windows" title="Convertly" icon="Repeat" menu={["File", "Edit", "View", "Help"]} footer="Ready" />
 * @example <WireframeMockup variant="OSX" title="Preview" footer="3 items" />
 */
export const WireframeMockup = ({
  id,
  variant = "Mobile",
  color = "Black",
  title,
  icon,
  menu,
  url,
  footer,
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

  const rows: MockupRows = {
    menu: (menu?.length ?? 0) > 0,
    footer: footer !== undefined && footer !== null && footer !== false,
  };

  const frame = React.useMemo(
    () => (w > 0 && h > 0 ? buildFrame(variant, w, h, strokeWidth, rows) : null),
    [w, h, variant, strokeWidth, rows.menu, rows.footer],
  );

  const [defaultWidth, defaultHeight] = DEFAULT_SIZE[variant];
  const insets = mockupInsets(variant, strokeWidth, rows);

  // Whether the content is taller than the frame it was given. Only possible when `height`
  // is set, because without one the frame grows instead.
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [clipped, setClipped] = React.useState(false);

  React.useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const check = () =>
      setClipped(
        node.scrollHeight - node.clientHeight > 2 || node.scrollWidth - node.clientWidth > 2,
      );

    check();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(check);
    observer.observe(node);
    return () => observer.disconnect();
  }, [children, height, variant, strokeWidth]);

  return (
    <div
      id={id}
      ref={ref}
      className={cn("relative inline-block", className)}
      style={{
        // The chrome's own space, so the content below lays out inside the screen and the
        // whole mockup grows with it. Height is a *minimum* unless the caller sets one:
        // an empty mockup should still look like its device, but a full one must not be
        // quietly cut off at the device's default size.
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        ...widgetStyle({ width: width ?? defaultWidth, height, aspectRatio, visible, style }),
        ...(height === undefined ? { minHeight: toCssSize(defaultHeight) } : {}),
      }}
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

      {frame?.iconBox && icon && (
        <span
          className="pointer-events-none absolute flex items-center justify-center select-none"
          style={{
            left: frame.iconBox.x,
            top: frame.iconBox.y,
            width: frame.iconBox.w,
            height: frame.iconBox.h,
          }}
        >
          <Icon name={icon} size={frame.iconBox.w} color={accent} />
        </span>
      )}

      {frame?.titleBar && title && (
        <span
          className={cn(
            "absolute flex items-center overflow-hidden font-bold text-ellipsis whitespace-nowrap select-none",
            frame.titleAlign === "center" ? "justify-center" : "justify-start",
            chromeText,
          )}
          style={
            frame.titleAlign === "center"
              ? {
                  // Kept clear of the traffic lights on the left and of the space their
                  // mirror would occupy on the right, so the title stays centred.
                  left: frame.titleBar.x + 70,
                  top: frame.titleBar.y,
                  width: Math.max(0, frame.titleBar.w - 140),
                  height: frame.titleBar.h,
                  color: accent,
                }
              : {
                  // After the app icon, and clear of the caption buttons.
                  left: frame.titleBar.x + (icon ? 32 : 12),
                  top: frame.titleBar.y,
                  width: Math.max(0, frame.titleBar.w - (icon ? 32 : 12) - CAPTIONS),
                  height: frame.titleBar.h,
                  color: accent,
                }
          }
        >
          {title}
        </span>
      )}

      {frame?.menuBar && rows.menu && (
        <span
          className={cn(
            "pointer-events-none absolute flex items-center gap-4 overflow-hidden px-3 whitespace-nowrap select-none",
            chromeText,
          )}
          style={{
            left: frame.menuBar.x,
            top: frame.menuBar.y,
            width: frame.menuBar.w,
            height: frame.menuBar.h,
            color: accent,
          }}
        >
          {menu!.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      )}

      {frame?.addressBar && url && (
        <span
          className={cn(
            "absolute flex items-center overflow-hidden text-ellipsis whitespace-nowrap opacity-75 select-none",
            chromeText,
          )}
          style={{
            // Past the favicon when there is one.
            left: frame.addressBar.x + (icon ? 26 : 12),
            top: frame.addressBar.y,
            width: Math.max(0, frame.addressBar.w - (icon ? 30 : 16)),
            height: frame.addressBar.h,
            color: accent,
          }}
        >
          {url}
        </span>
      )}

      {/* In normal flow, not absolutely positioned: this is what lets the frame grow to fit.
          `min-w-0` so a wide child scrolls its own container rather than stretching the
          device. */}
      <div
        ref={contentRef}
        className="relative z-[1] h-full min-w-0 overflow-hidden"
        style={
          clipped
            ? {
                // Fades into the tear, so the cut reads as "there is more" rather than as a
                // child that happens to end at the edge.
                maskImage: "linear-gradient(to bottom, #000 calc(100% - 26px), transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 26px), transparent)",
              }
            : undefined
        }
      >
        {children}
      </div>

      {frame?.footerBar && rows.footer && (
        <div
          className={cn(
            "absolute z-[1] flex items-center overflow-hidden px-3 whitespace-nowrap",
            chromeText,
          )}
          style={{
            left: frame.footerBar.x,
            top: frame.footerBar.y,
            width: frame.footerBar.w,
            height: frame.footerBar.h,
            color: accent,
          }}
        >
          {footer}
        </div>
      )}

      {/* A torn edge when the content did not fit.
          Silent clipping is the failure this replaces: a mockup with no `height` used to cut
          its content off at the device's default size with nothing to show it had. Now it
          grows instead — and when a caller pins the height, the cut is drawn. */}
      {clipped && frame && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
        >
          <RoughShape
            shape={{ kind: "linearPath", points: tearPoints(frame.screen, `${id}-tear`) }}
            seed={`${id}-tear`}
            stroke={accent}
            strokeWidth={strokeWidth * 0.9}
            roughness={1.8}
          />
        </svg>
      )}
    </div>
  );
};
