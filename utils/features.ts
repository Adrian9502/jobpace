import { KanbanSquare, ClipboardList, BarChart2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  label: string;
  desc: string;
  icon: LucideIcon;
}

export const features: Feature[] = [
  {
    label: "Kanban board",
    desc: "Drag and drop across Applied, Screening, Interview, Offer",
    icon: KanbanSquare,
  },
  {
    label: "Application tracker",
    desc: "Stay accountable with a detailed record of every update and interaction.",
    icon: ClipboardList,
  },
  {
    label: "Analytics & insights",
    desc: "Visualize your entire search history in a chronological stream.",
    icon: BarChart2,
  },
];