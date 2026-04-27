"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  {
    section: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zm-7 7h5v5H2V9zm7 0h5v5H9V9z" />
          </svg>
        ),
      },
      {
        label: "All Applications",
        href: "/dashboard/applications",
        badge: null,
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <rect x="2" y="3" width="12" height="11" rx="1.5" />
            <path d="M5 2v2M11 2v2M2 7h12" />
          </svg>
        ),
      },
      {
        label: "Kanban Board",
        href: "/dashboard/kanban",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <rect x="2" y="2" width="3" height="12" rx="1" />
            <rect x="7" y="2" width="3" height="9" rx="1" />
            <rect x="12" y="2" width="3" height="6" rx="1" />
          </svg>
        ),
      },
       {
        label: "Archive",
        href: "/dashboard/archive",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="M2.5 3h11v2h-11zM3.5 5v8a1 1 0 001 1h7a1 1 0 001-1V5" />
            <path d="M6 8h4" />
          </svg>
        ),
      },
      {
        label: "Timeline",
        href: "/dashboard/timeline",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 2" />
          </svg>
        ),
      },
      {
        label: "Activity Logs",
        href: "/dashboard/activity",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <polyline points="2 8 6 8 8 3 10 13 12 8 16 8"></polyline>
          </svg>
        ),
      },
     
    ],
  },
  {
    section: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="M2 12L5 8l3 2 3-4 3 2" />
            <path d="M2 14h12" />
          </svg>
        ),
      },
      {
        label: "Reminders",
        href: "/dashboard/reminders",
        badge: 3,
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="M8 2a6 6 0 100 12A6 6 0 008 2z" />
            <path d="M8 5v3l2 2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Profile",
    items: [
      {
        label: "Portfolio",
        href: "/dashboard/portfolio",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M5 6h6M5 9h4" />
          </svg>
        ),
      },
      {
        label: "Achievements",
        href: "/dashboard/achievements",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.1l-3.7 2.2.7-4.1-3-2.9 4.2-.7z" />
          </svg>
        ),
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4" />
          </svg>
        ),
      },
    ],
  },
];

interface SidebarContentProps {
  pathname: string;
  userName: string;
  userImage?: string | null;
  initials: string;
  onNavClick?: () => void;
}

function SidebarContent({
  pathname,
  userName,
  userImage,
  initials,
  onNavClick,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 transition-colors">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center shrink-0">
          <Image
            src="/jobpace-logo-final.png"
            alt="Job Pace Logo"
            width={20}
            height={20}
            className="brightness-0 invert"
          />
        </div>

        <Image
          src="/jobpace-title-only.png"
          alt="Job Pace title logo"
          width={100}
          height={20}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="px-2 pt-3 pb-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge ? (
                    <span className="bg-orange-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => {
            if (document.documentElement.classList.contains('dark')) {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            } else {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            }
          }}
          className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 hidden dark:block">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.8 3.8l.7.7M11.5 11.5l.7.7M3.8 12.2l.7-.7M11.5 4.5l.7-.7" />
          </svg>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 block dark:hidden">
            <path d="M14 10A6 6 0 116 2a6.3 6.3 0 008 8z" />
          </svg>
          <span className="flex-1 text-left font-medium">Toggle Theme</span>
        </button>
      </div>

      {/* User footer */}
      <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={28}
              height={28}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-zinc-900 dark:text-zinc-100 text-xs font-medium truncate">
              {userName}
            </div>
            <div className="text-zinc-400 dark:text-zinc-500 text-xs">Sign out</div>
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="#97A0AF"
            strokeWidth="1.5"
            className="w-3.5 h-3.5 shrink-0"
          >
            <path d="M6 4l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

interface SidebarProps {
  userName: string;
  userImage?: string | null;
}

export default function Sidebar({ userName, userImage }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sharedProps = { pathname, userName, userImage, initials };

  // Sync theme on mount
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="#172B4D"
          strokeWidth="1.5"
          className="w-4 h-4"
        >
          {mobileOpen ? (
            <path d="M3 3l10 10M13 3L3 13" />
          ) : (
            <path d="M2 4h12M2 8h12M2 12h12" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-56 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-40 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent
          {...sharedProps}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors">
        <SidebarContent {...sharedProps} />
      </aside>
    </>
  );
}
