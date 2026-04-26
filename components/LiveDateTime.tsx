"use client";

import { useEffect, useState } from "react";

export default function LiveDateTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    // Placeholder to prevent layout shift during SSR hydration
    return <div className="h-10 w-[200px] animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg"></div>;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500 dark:text-blue-400">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="flex items-center pl-1">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">
          {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
