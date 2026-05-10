import { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

export interface NavGroup {
  section: string;
  items: NavItem[];
}
