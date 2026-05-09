"use client";

import { useState } from "react";
import { ACTION_TYPES } from "@/lib/constants";
import PaginationBar from "@/components/ui/PaginationBar";
import ActivityLogItem from "./ActivityLogItem";
import LogDetailModal from "./LogDetailModal";
import type { ActivityLog } from "@/types/activity";

const PAGE_SIZE = 15;

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "CREATE", label: "Created" },
  { key: "UPDATE", label: "Updated" },
  { key: "STATUS_CHANGE", label: "Stage Changed" },
  { key: "DELETE", label: "Deleted" },
];

export default function ActivityClient({ logs }: { logs: ActivityLog[] }) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered =
    filter === "ALL" ? logs : logs.filter((l) => l.actionType === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function handleFilterChange(f: string) {
    setFilter(f);
    setPage(1);
  }

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const cfg = ACTION_TYPES[key];
          return (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active
                  ? cfg
                    ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-500 self-center">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🕒</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            No activity yet
          </p>
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">
            Actions you make on your Dashboard will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-4 md:ml-6 space-y-6 pb-4 mt-2">
            {paginated.map((log) => (
              <ActivityLogItem
                key={log.id}
                log={log}
                onViewDetails={() => setSelectedLog(log)}
              />
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <PaginationBar
              page={safePage}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </div>
        </div>
      )}

      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  );
}
