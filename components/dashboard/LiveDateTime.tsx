"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

export default function LiveDateTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="h-9 w-40 sm:w-[220px] animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg" />
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
      {/* Date — hidden on smallest screens */}
      <div className="hidden sm:flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">
        <Calendar className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
          {time.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Time — always visible */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400 sm:hidden" />
        <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums whitespace-nowrap">
          {time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
