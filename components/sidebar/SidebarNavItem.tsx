"use client";

import Link from "next/link";
import { NavItem } from "@/types/nav";

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  onNavClick?: () => void;
}

export default function SidebarNavItem({
  item,
  isActive,
  onNavClick,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavClick}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span className="bg-orange-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
