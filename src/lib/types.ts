import type * as React from "react";

/** Sizing / spacing scale shared by every widget, mirroring `Ivy.Densities`. */
export type Densities = "Small" | "Medium" | "Large";

export type Orientation = "Horizontal" | "Vertical";

export type Align =
  | "TopLeft"
  | "TopRight"
  | "TopCenter"
  | "BottomLeft"
  | "BottomRight"
  | "BottomCenter"
  | "Left"
  | "Right"
  | "Center"
  | "Stretch"
  | "SpaceBetween"
  | "SpaceAround"
  | "SpaceEvenly";

export type BorderStyle = "None" | "Solid" | "Dashed" | "Dotted";

export type BorderRadius = "None" | "Rounded" | "Full";

export type Overflow = "Clip" | "Ellipsis" | "Auto" | "Visible" | "Scroll";

export type TextAlignment = "Left" | "Center" | "Right" | "Justify";

export type HoverEffect = "None" | "Pointer" | "PointerAndTranslate" | "Shadow";

export type Sizing = number | string;

/** Item shared by `DropDownMenu`, `Toolbar`, `Tree` and every row-action surface. */
export interface MenuItem {
  label: string;
  icon?: string;
  tag?: string;
  tooltip?: string;
  children?: MenuItem[];
  variant?: "Default" | "Separator" | "Checkbox" | "Radio" | "Group";
  checked?: boolean;
  disabled?: boolean;
  color?: string;
  shortcut?: string;
  badge?: string;
  expanded?: boolean;
  path?: string;
  onSelect?: (item: MenuItem) => void;
}

export interface Option {
  value: string | number;
  label?: string;
  description?: string;
  group?: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
}

export type NullableSelectValue = string | number | string[] | number[] | null | undefined;

export type FileUploadStatus = "Pending" | "Aborted" | "Loading" | "Failed" | "Finished";

export interface FileItem {
  id: string;
  fileName: string;
  contentType: string;
  length: number;
  progress: number;
  status: FileUploadStatus;
}

export interface InternalLink {
  title: string;
  appId: string;
}

/** Props every widget accepts on top of its own, mirroring `Ivy.WidgetBase`. */
export interface WidgetBaseProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}
