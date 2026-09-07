import type { MenuItem, Option } from "@/lib/types";

export const options: Option[] = [
  { value: "design", label: "Design", description: "Wireframes and mockups", icon: "PenTool" },
  { value: "build", label: "Build", description: "Write the code", icon: "Hammer", group: "Delivery" },
  { value: "test", label: "Test", description: "Find the bugs", icon: "Bug", group: "Delivery" },
  { value: "ship", label: "Ship", icon: "Rocket", group: "Delivery", disabled: true },
];

export const menuItems: MenuItem[] = [
  { label: "Rename", icon: "Pencil", shortcut: "F2" },
  { label: "Duplicate", icon: "Copy", shortcut: "⌘D" },
  { label: "Share", icon: "Share2", badge: "2" },
  { label: "sep", variant: "Separator" },
  { label: "Delete", icon: "Trash2", color: "Destructive" },
];

export const treeItems: MenuItem[] = [
  {
    label: "src",
    icon: "Folder",
    expanded: true,
    children: [
      { label: "index.ts", icon: "FileCode" },
      {
        label: "widgets",
        icon: "Folder",
        children: [
          { label: "Button.tsx", icon: "FileCode" },
          { label: "Card.tsx", icon: "FileCode" },
        ],
      },
    ],
  },
  { label: "README.md", icon: "FileText" },
  { label: "package.json", icon: "FileJson", tag: "v0.1.0" },
];

export const sales = [
  { month: "Jan", revenue: 120, cost: 80 },
  { month: "Feb", revenue: 180, cost: 95 },
  { month: "Mar", revenue: 150, cost: 110 },
  { month: "Apr", revenue: 220, cost: 130 },
  { month: "May", revenue: 260, cost: 140 },
  { month: "Jun", revenue: 210, cost: 120 },
];

export const share = [
  { name: "Design", value: 34 },
  { name: "Build", value: 46 },
  { name: "Test", value: 20 },
];

export const people = [
  { name: "Ada Lovelace", role: "Admin", score: 98, active: true, joined: "2024-02-11" },
  { name: "Grace Hopper", role: "Editor", score: 91, active: true, joined: "2024-05-03" },
  { name: "Alan Turing", role: "Editor", score: 65, active: false, joined: "2023-11-20" },
  { name: "Katherine Johnson", role: "Viewer", score: 88, active: true, joined: "2025-01-09" },
  { name: "Linus Torvalds", role: "Viewer", score: 72, active: true, joined: "2025-03-17" },
];
