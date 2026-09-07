import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { RoughGenerator } from "roughjs/bin/generator";
import type { Options as RoughOptions } from "roughjs/bin/core";

export type { RoughOptions };

export interface RoughPath {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

const generator = new RoughGenerator();

/** Shapes the sketch layer knows how to draw behind or around content. */
export type SketchShape =
  | { kind: "rectangle"; x?: number; y?: number; width: number; height: number }
  | { kind: "ellipse"; cx: number; cy: number; width: number; height: number }
  | { kind: "circle"; cx: number; cy: number; diameter: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  | { kind: "linearPath"; points: [number, number][] }
  | { kind: "polygon"; points: [number, number][] }
  | { kind: "curve"; points: [number, number][] }
  | { kind: "arc"; x: number; y: number; width: number; height: number; start: number; stop: number; closed?: boolean }
  | { kind: "path"; d: string };

function draw(shape: SketchShape, options: RoughOptions) {
  switch (shape.kind) {
    case "rectangle":
      return generator.rectangle(shape.x ?? 0, shape.y ?? 0, shape.width, shape.height, options);
    case "ellipse":
      return generator.ellipse(shape.cx, shape.cy, shape.width, shape.height, options);
    case "circle":
      return generator.circle(shape.cx, shape.cy, shape.diameter, options);
    case "line":
      return generator.line(shape.x1, shape.y1, shape.x2, shape.y2, options);
    case "linearPath":
      return generator.linearPath(shape.points, options);
    case "polygon":
      return generator.polygon(shape.points, options);
    case "curve":
      return generator.curve(shape.points, options);
    case "arc":
      return generator.arc(
        shape.x,
        shape.y,
        shape.width,
        shape.height,
        shape.start,
        shape.stop,
        shape.closed ?? false,
        options,
      );
    case "path":
      return generator.path(shape.d, options);
  }
}

/**
 * Converts a shape into plain SVG path descriptors so callers can render them
 * declaratively instead of letting rough.js mutate the DOM.
 */
export function roughPaths(shape: SketchShape, options: RoughOptions): RoughPath[] {
  if (
    (shape.kind === "rectangle" || shape.kind === "ellipse") &&
    (shape.width <= 0 || shape.height <= 0)
  ) {
    return [];
  }
  const drawable = draw(shape, options);
  return generator.toPaths(drawable) as RoughPath[];
}

export function useRoughPaths(shape: SketchShape | null, options: RoughOptions): RoughPath[] {
  const key = JSON.stringify([shape, options]);
  return useMemo(() => (shape ? roughPaths(shape, options) : []), [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Tracks an element's border box so the sketch layer can be redrawn to fit. */
export function useMeasuredSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((previous) =>
        Math.abs(previous.width - width) < 0.5 && Math.abs(previous.height - height) < 0.5
          ? previous
          : { width, height },
      );
    };

    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
