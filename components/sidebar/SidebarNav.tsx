"use client";

import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import SidebarNavItem from "./SidebarNavItem";

interface SidebarNavProps {
  onNavClick?: () => void;
  remindersCount?: number;
}

export default function SidebarNav({
  onNavClick,
  remindersCount = 0,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5">
      {navItems.map((group) => (
        <div key={group.section}>
          <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            {group.section}
          </div>
          {group.items.map((item) => {
            // Override the badge for Reminders
            const isReminders = item.href === "/dashboard/reminders";
            const badge = isReminders
              ? remindersCount > 0
                ? remindersCount > 50 ? "50+" : remindersCount
                : undefined
              : item.badge;

            return (
              <SidebarNavItem
                key={item.href}
                item={{ ...item, badge }}
                isActive={pathname === item.href}
                onNavClick={onNavClick}
              />
            );
          })}
        </div>
      ))}
    </nav>
  );
}
