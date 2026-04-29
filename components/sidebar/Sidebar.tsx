"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import SidebarLogo from "./SidebarLogo";
import SidebarNav from "./SidebarNav";
import SidebarThemeToggle from "./SidebarThemeToggle";
import SidebarUserFooter from "./SidebarUserFooter";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  userName: string;
  userImage?: string | null;
}

export default function Sidebar({ userName, userImage }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitials(userName);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-56 z-40
          bg-white dark:bg-zinc-900
          border-r border-zinc-200 dark:border-zinc-800
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex lg:flex-col lg:h-screen lg:shrink-0
        `}
      >
        <div className="flex flex-col h-full">
          <SidebarLogo />
          <SidebarNav onNavClick={() => setMobileOpen(false)} />
          <SidebarThemeToggle />
          <SidebarUserFooter
            userName={userName}
            userImage={userImage}
            initials={initials}
          />
        </div>
      </aside>
    </>
  );
}
