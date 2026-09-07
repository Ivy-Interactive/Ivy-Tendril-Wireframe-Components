import { icons, HelpCircle, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveColor } from "./colors";
import { useSketchTheme } from "./SketchProvider";

export type IconName = keyof typeof icons | (string & {});

const toPascalCase = (name: string) =>
  name
    .replace(/[_\s]+/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export function lookupIcon(name?: string | null) {
  if (!name || name === "None") return null;
  const key = toPascalCase(name) as keyof typeof icons;
  return icons[key] ?? icons[name as keyof typeof icons] ?? HelpCircle;
}

export interface IconProps extends Omit<LucideProps, "ref" | "color" | "name"> {
  /** Lucide icon name, matching Ivy's `Icons` enum (e.g. `"Rocket"`). */
  name?: string | null;
  color?: string;
  size?: number;
  /** Set false to opt this icon out of the hand-drawn wobble filter. */
  wobble?: boolean;
}

/**
 * Lucide icons, pushed through a turbulence filter so they read as sketched
 * rather than vector-crisp.
 */
export const Icon = ({ name, color, size = 16, wobble, className, ...rest }: IconProps) => {
  const theme = useSketchTheme();
  const Component = lookupIcon(name);
  if (!Component) return null;

  const applyWobble = wobble ?? theme.wobbleGlyphs;

  return (
    <Component
      aria-hidden="true"
      size={size}
      strokeWidth={1.75}
      absoluteStrokeWidth
      color={resolveColor(color, "currentColor")}
      className={cn("shrink-0", applyWobble && "[filter:url(#tendril-wobble)]", className)}
      {...rest}
    />
  );
};
