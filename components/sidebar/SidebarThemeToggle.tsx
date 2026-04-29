"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SidebarThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Wait for mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded text-sm text-zinc-700 dark:text-zinc-300">
          <div className="w-4 h-4" />
          <span className="flex-1 text-left font-medium">Toggle Theme</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 border-t border-zinc-100 dark:border-zinc-800">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
        <span className="flex-1 text-left font-medium">Toggle Theme</span>
      </button>
    </div>
  );
}

