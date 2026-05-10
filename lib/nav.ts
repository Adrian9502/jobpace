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
  StickyNote,
  Settings,
  Mail,
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
        icon: FileText,
      },
      {
        label: "Interview Calendar",
        href: "/dashboard/calendar",
        icon: CalendarDays,
      },
      { label: "Kanban Board", href: "/dashboard/kanban", icon: Kanban },
      { label: "Archive", href: "/dashboard/archive", icon: Archive },
      { label: "Notes", href: "/dashboard/notes", icon: StickyNote },
      { label: "Timeline", href: "/dashboard/timeline", icon: Clock },
      { label: "Activity Logs", href: "/dashboard/activity", icon: Activity },
      {
        label: "Email Templates",
        href: "/dashboard/email-templates",
        icon: Mail,
      },
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
      },
    ],
  },

  {
    section: "Profile",
    items: [
      {
        label: "Resume & Documents",
        href: "/dashboard/resume-and-documents",
        icon: FileText,
      },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];
