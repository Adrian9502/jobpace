"use client";

import { useState } from "react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  actionType: string;
  description: string;
  applicationId: string | null;
  createdAt: string | Date | null;
}

interface ChangeEntry {
  field: string;
  from: string | null;
  to: string | null;
}

interface ParsedLog {
  summary: string;
  changes: ChangeEntry[];
}

// ──────────────────────────────────────────────
// Description parser
// ──────────────────────────────────────────────

function parseLog(description: string): ParsedLog {
  // New format: JSON with { summary, changes }
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed.summary === "string") {
      return {
        summary: parsed.summary,
        changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      };
    }
  } catch {
    // Not JSON — fall through to legacy parsing
  }

  // Legacy format: plain text strings ("X changed from A to B", etc.)
  const changeMatch = description.match(/^(.+?)\s+changed from\s+(.+?)\s+to\s+(.+)$/i);
  if (changeMatch) {
    return {
      summary: description,
      changes: [{ field: changeMatch[1].trim(), from: changeMatch[2].trim(), to: changeMatch[3].trim() }],
    };
  }

  const setMatch = description.match(/^(.+?)\s+set to\s+(.+)$/i);
  if (setMatch) {
    return {
      summary: description,
      changes: [{ field: setMatch[1].trim(), from: null, to: setMatch[2].trim() }],
    };
  }

  const deleteMatch = description.match(/^Deleted application for\s+(.+)$/i);
  if (deleteMatch) {
    return {
      summary: description,
      changes: [{ field: "Application", from: deleteMatch[1].trim(), to: null }],
    };
  }

  return { summary: description, changes: [] };
}

// ──────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────

function toDate(d: string | Date | null): Date | null {
  if (!d) return null;
  return typeof d === "string" ? new Date(d) : d;
}

function formatDateTime(date: string | Date | null): string {
  const d = toDate(date);
  if (!d) return "—";
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateShort(date: string | Date | null): string {
  const d = toDate(date);
  if (!d) return "—";
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeShort(date: string | Date | null): string {
  const d = toDate(date);
  if (!d) return "—";
  return d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ──────────────────────────────────────────────
// Action config
// ──────────────────────────────────────────────

const ACTION_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dotColor: string }
> = {
  CREATE: {
    label: "Created",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  UPDATE: {
    label: "Updated",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
  },
  STATUS_CHANGE: {
    label: "Status Changed",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  DELETE: {
    label: "Deleted",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  applied:   { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-700 dark:text-blue-300" },
  interview: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
  exam:      { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  offer:     { bg: "bg-teal-100 dark:bg-teal-900/30",     text: "text-teal-700 dark:text-teal-300" },
  hired:     { bg: "bg-green-100 dark:bg-green-900/30",   text: "text-green-700 dark:text-green-300" },
  rejected:  { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-700 dark:text-red-300" },
  ghosted:   { bg: "bg-zinc-100 dark:bg-zinc-800",        text: "text-zinc-500 dark:text-zinc-400" },
};

function ValueChip({ value }: { value: string }) {
  const normalized = value.toLowerCase().trim();
  const cfg = STATUS_COLORS[normalized];
  if (cfg) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    );
  }
  return <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">{value}</span>;
}

// ──────────────────────────────────────────────
// Log Detail Modal
// ──────────────────────────────────────────────

function LogDetailModal({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const cfg = ACTION_CONFIG[log.actionType] ?? ACTION_CONFIG.UPDATE;
  const { summary, changes } = parseLog(log.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Summary */}
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{summary}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
              {formatDateTime(log.createdAt)}
            </div>
          </div>

          {/* Changes */}
          {changes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {changes.length === 1 ? "Change" : `Changes (${changes.length})`}
              </h4>

              {changes.map((c, i) => {
                const isChange = c.from !== null && c.to !== null;
                const isCreate = c.from === null && c.to !== null;
                const isDelete = c.from !== null && c.to === null;

                return (
                  <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 overflow-hidden">
                    {/* Field label */}
                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{c.field}</span>
                    </div>

                    {isChange && (
                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700/60">
                        <div className="p-4 bg-red-50/50 dark:bg-red-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">Before</p>
                          <ValueChip value={c.from!} />
                        </div>
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">After</p>
                          <ValueChip value={c.to!} />
                        </div>
                      </div>
                    )}

                    {isCreate && (
                      <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2">Set to</p>
                        <ValueChip value={c.to!} />
                      </div>
                    )}

                    {isDelete && (
                      <div className="p-4 bg-red-50/30 dark:bg-red-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">Deleted</p>
                        <ValueChip value={c.from!} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Linked Application ID */}
          {log.applicationId && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                Linked Application ID
              </h4>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-4 py-2.5 border border-zinc-200 dark:border-zinc-700/60">
                {log.applicationId}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Action badge (table cell)
// ──────────────────────────────────────────────

function ActionBadge({ actionType }: { actionType: string }) {
  const cfg = ACTION_CONFIG[actionType] ?? ACTION_CONFIG.UPDATE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

// ──────────────────────────────────────────────
// Pagination bar
// ──────────────────────────────────────────────

const PAGE_SIZE = 15;

function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (totalPages <= 7) return true;
      return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
    })
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && typeof arr[i - 1] === "number" && (p as number) - (arr[i - 1] as number) > 1) {
        acc.push("…");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{start}–{end}</span>{" "}
        of{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          ← Prev
        </button>

        {pageNums.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="px-1 text-xs text-zinc-400 dark:text-zinc-600">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`min-w-[30px] h-[30px] rounded-md text-xs font-medium transition-colors border ${
                page === p
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export default function ActivityClient({ logs }: { logs: ActivityLog[] }) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.actionType === filter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(f: string) {
    setFilter(f);
    setPage(1);
  }

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "ALL", label: "All" },
          { key: "CREATE", label: "Created" },
          { key: "UPDATE", label: "Updated" },
          { key: "STATUS_CHANGE", label: "Status Changed" },
          { key: "DELETE", label: "Deleted" },
        ].map(({ key, label }) => {
          const active = filter === key;
          const cfg = ACTION_CONFIG[key];
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
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">No activity yet</p>
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">
            Actions you make on your Dashboard will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide whitespace-nowrap">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide whitespace-nowrap">Time</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, idx) => {
                  const { summary } = parseLog(log.description);
                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${
                        idx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"
                      }`}
                    >
                      {/* Row number */}
                      <td className="px-4 py-3.5 text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                        {(safePage - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3.5">
                        <ActionBadge actionType={log.actionType} />
                      </td>

                      {/* Summary */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{summary}</p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateShort(log.createdAt)}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatTimeShort(log.createdAt)}
                      </td>

                      {/* View button */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                            <circle cx="8" cy="8" r="3" />
                            <path d="M1.5 8S4 3 8 3s6.5 5 6.5 5S14 13 8 13 1.5 8 1.5 8z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPage={setPage}
          />
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  );
}
