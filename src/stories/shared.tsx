import * as React from "react";
import { Separator } from "@/widgets/primitives/Separator";

/**
 * The labelled strip every "here are all the variants" story lays its examples
 * out in. Kept out of a `.stories.tsx` file so Storybook does not try to index
 * it as a section of its own.
 */
export const Row = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mb-8">
    {title && <Separator text={title} />}
    <div className="mt-3 flex flex-wrap items-start gap-4">{children}</div>
  </div>
);

/** A column, for widgets that want the full width to themselves. */
export const Stack = ({
  title,
  width = "24rem",
  children,
}: {
  title?: string;
  width?: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    {title && <Separator text={title} />}
    <div className="mt-3 flex flex-col gap-4" style={{ width }}>
      {children}
    </div>
  </div>
);

/** A bordered box for layout widgets, which need something to fill. */
export const Frame = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <div className="mb-8">
    {title && <Separator text={title} />}
    <div className="mt-3 rounded border border-dashed border-ink-faint">{children}</div>
  </div>
);

export const DENSITIES = ["Small", "Medium", "Large"] as const;
