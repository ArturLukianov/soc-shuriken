// lib/categories.ts
import {
  BinaryIcon,
  CrosshairIcon,
  FilterIcon,
  type LucideIcon,
  ScanSearchIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  TextIcon,
} from "lucide-react";

export type OperationCategory =
  | "intel"
  | "extract"
  | "filter"
  | "ioc"
  | "decode"
  | "logs"
  | "text";

export type CategoryInfo = {
  id: OperationCategory;
  label: string;
  Icon: LucideIcon;
  // Badge colors (background + foreground)
  className: string;
};

// Display order in the operations panel
export const CATEGORIES: CategoryInfo[] = [
  {
    id: "intel",
    label: "Threat intel",
    Icon: ShieldAlertIcon,
    className: "bg-red-900 text-red-300",
  },
  {
    id: "extract",
    label: "Extract",
    Icon: ScanSearchIcon,
    className: "bg-purple-900 text-purple-300",
  },
  {
    id: "filter",
    label: "Filter",
    Icon: FilterIcon,
    className: "bg-blue-900 text-blue-300",
  },
  {
    id: "ioc",
    label: "IOC & hunting",
    Icon: CrosshairIcon,
    className: "bg-orange-900 text-orange-300",
  },
  {
    id: "decode",
    label: "Decode & encode",
    Icon: BinaryIcon,
    className: "bg-green-900 text-green-300",
  },
  {
    id: "logs",
    label: "Logs & parsing",
    Icon: ScrollTextIcon,
    className: "bg-cyan-900 text-cyan-300",
  },
  {
    id: "text",
    label: "Text & lines",
    Icon: TextIcon,
    className: "bg-yellow-900 text-yellow-300",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<OperationCategory, CategoryInfo>;
