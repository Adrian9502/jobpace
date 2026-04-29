import {
  LayoutDashboard,
  CalendarDays,
  Kanban,
  Archive,
  Clock,
  Activity,
  BarChart2,
  Bell,
  FileText,
  Trophy,
  Settings,
} from "lucide-react";
import { NavGroup } from "@/types/nav";

export const navItems: NavGroup[] = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "All Applications",
        href: "/dashboard/applications",
        icon: CalendarDays,
      },
      { label: "Kanban Board", href: "/dashboard/kanban", icon: Kanban },
      { label: "Archive", href: "/dashboard/archive", icon: Archive },
      { label: "Timeline", href: "/dashboard/timeline", icon: Clock },
      { label: "Activity Logs", href: "/dashboard/activity", icon: Activity },
    ],
  },
  {
    section: "Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
      {
        label: "Reminders",
        href: "/dashboard/reminders",
        icon: Bell,
        badge: 3,
      },
    ],
  },
  {
    section: "Profile",
    items: [
      { label: "Portfolio", href: "/dashboard/portfolio", icon: FileText },
      { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];
