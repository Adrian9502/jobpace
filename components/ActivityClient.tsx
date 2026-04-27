"use client";

import { useState } from "react";
import { STAGE_CONFIG, STATUS_CONFIG, ACTION_TYPES } from "@/lib/constants";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import PaginationBar from "./PaginationBar";

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

  const changeMatch = description.match(/^(.+?)\s+changed from\s+(.+?)\s+to\s+(.+)$/i);
  if (changeMatch) {
    return { summary: description, changes: [{ field: changeMatch[1].trim(), from: changeMatch[2].trim(), to: changeMatch[3].trim() }] };
  }

  const setMatch = description.match(/^(.+?)\s+set to\s+(.+)$/i);
  if (setMatch) {
    return { summary: description, changes: [{ field: setMatch[1].trim(), from: null, to: setMatch[2].trim() }] };
  }

  const deleteMatch = description.match(/^Deleted application for\s+(.+)$/i);
  if (deleteMatch) {
    return { summary: description, changes: [{ field: "Application", from: deleteMatch[1].trim(), to: null }] };
  }

  return { summary: description, changes: [] };
}

// ──────────────────────────────────────────────
// Value chip (status-aware)
// ──────────────────────────────────────────────

function ValueChip({ value, field }: { value: string, field: string }) {
  const normalized = value.toLowerCase().trim();
  
  if (field === "Stage") {
    // Stage value chip
    const cfg = Object.values(STAGE_CONFIG).find(c => c.label.toLowerCase() === normalized) || (STAGE_CONFIG as any)[normalized];
    if (cfg) {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      );
    }
  } else if (field === "Status") {
    // Status value chip
    const cfg = Object.values(STATUS_CONFIG).find(c => c.label.toLowerCase() === normalized) || (STATUS_CONFIG as any)[normalized];
    if (cfg) {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      );
    }
  }

  return <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">{value}</span>;
}

// ──────────────────────────────────────────────
// Log Detail Modal
// ──────────────────────────────────────────────

function LogDetailModal({ log, onClose }: { log: ActivityLog; onClose: () => void }) {
  const cfg = ACTION_TYPES[log.actionType] ?? ACTION_TYPES.UPDATE;
  const { summary, changes } = parseLog(log.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            {cfg.label}
          </span>
          <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{summary}</p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
              {formatDateTime(log.createdAt)}
            </div>
          </div>

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
                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{c.field}</span>
                    </div>
                    {isChange && (
                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700/60">
                        <div className="p-4 bg-red-50/50 dark:bg-red-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">Before</p>
                          <ValueChip value={c.from!} field={c.field} />
                        </div>
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">After</p>
                          <ValueChip value={c.to!} field={c.field} />
                        </div>
                      </div>
                    )}
                    {isCreate && (
                      <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2">Set to</p>
                        <ValueChip value={c.to!} field={c.field} />
                      </div>
                    )}
                    {isDelete && (
                      <div className="p-4 bg-red-50/30 dark:bg-red-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-2">Deleted</p>
                        <ValueChip value={c.from!} field={c.field} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {log.applicationId && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Linked Application ID</h4>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-4 py-2.5 border border-zinc-200 dark:border-zinc-700/60">{log.applicationId}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Action badge
// ──────────────────────────────────────────────

function ActionBadge({ actionType }: { actionType: string }) {
  const cfg = ACTION_TYPES[actionType] ?? ACTION_TYPES.UPDATE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function ActivityClient({ logs }: { logs: ActivityLog[] }) {
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.actionType === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(f: string) { setFilter(f); setPage(1); }

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "ALL", label: "All" },
          { key: "CREATE", label: "Created" },
          { key: "UPDATE", label: "Updated" },
          { key: "STATUS_CHANGE", label: "Stage Changed" },
          { key: "DELETE", label: "Deleted" },
        ].map(({ key, label }) => {
          const active = filter === key;
          const cfg = ACTION_TYPES[key];
          return (
            <button key={key} onClick={() => handleFilterChange(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                active
                  ? cfg ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >{label}</button>
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
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">Actions you make on your Dashboard will appear here.</p>
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
                    <tr key={log.id} className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${idx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"}`}>
                      <td className="px-4 py-3.5 text-xs text-zinc-400 dark:text-zinc-600 font-mono">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3.5"><ActionBadge actionType={log.actionType} /></td>
                      <td className="px-4 py-3.5 max-w-xs"><p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{summary}</p></td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><circle cx="8" cy="8" r="3" /><path d="M1.5 8S4 3 8 3s6.5 5 6.5 5S14 13 8 13 1.5 8 1.5 8z" /></svg>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationBar page={safePage} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </div>
      )}

      {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </>
  );
}
