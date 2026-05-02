"use client";

import { useState, useMemo } from "react";
import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG } from "@/lib/constants";
import type { Stage } from "@/lib/constants";
import { STAGE_FILTERS } from "@/utils/timeline";
import TimelineCard from "@/components/timeline/TimelineCard";

export default function TimelineClient({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const [filter, setFilter] = useState("All");

  const filteredApps = useMemo(() => {
    return applications
      .filter(
        (app) =>
          filter === "All" ||
          STAGE_CONFIG[app.stage as Stage]?.label === filter,
      )
      .sort((a, b) => {
        const diff =
          new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        return diff !== 0 ? diff : b.id.localeCompare(a.id);
      });
  }, [applications, filter]);

  const groupedApps = useMemo(() => {
    return filteredApps.reduce<Record<string, ApplicationRow[]>>((acc, app) => {
      const key = new Date(app.dateApplied).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      (acc[key] ??= []).push(app);
      return acc;
    }, {});
  }, [filteredApps]);

  return (
    <div className="pb-12 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        {STAGE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === f
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            No applications found
          </p>
          <p className="text-sm mt-1 text-zinc-400">
            Try a different stage filter.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedApps).map(([monthKey, monthApps]) => (
            <div key={monthKey}>
              {/* Month header */}
              <div className="sticky top-0 z-10 flex items-center gap-3 py-2.5 bg-zinc-50 dark:bg-zinc-950">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {monthKey}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {monthApps.length}
                </span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>

              {/* Items */}
              <div className="mt-4 relative space-y-4">
                <div className="absolute top-3 bottom-3 left-18 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                {monthApps.map((app) => {
                  const stageCfg =
                    STAGE_CONFIG[app.stage as Stage] ?? STAGE_CONFIG.applied;
                  const d = new Date(app.dateApplied);
                  return (
                    <div
                      key={app.id}
                      className="relative flex gap-4 sm:gap-5 items-start"
                    >
                      {/* Date */}
                      <div className="hidden sm:flex flex-col items-end w-16 shrink-0 pt-3.5 select-none">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase leading-none">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight">
                          {d.getDate()}
                        </span>
                      </div>
                      {/* Dot */}
                      <div className="hidden sm:flex relative z-10 mt-4 w-5 h-5 shrink-0 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-950 ring-4 ring-zinc-50 dark:ring-zinc-950 border border-zinc-200 dark:border-zinc-700">
                        <div
                          className={`w-2 h-2 rounded-full ${stageCfg.dot}`}
                        />
                      </div>
                      {/* Card */}
                      <TimelineCard app={app} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
