import { X, Clock } from "lucide-react";
import { ACTION_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { parseLog } from "@/types/activity-parser";
import ValueChip from "./ValueChip";
import type { ActivityLog } from "@/types/activity";

export default function LogDetailModal({
  log,
  onClose,
}: {
  log: ActivityLog;
  onClose: () => void;
}) {
  const cfg = ACTION_TYPES[log.actionType] ?? ACTION_TYPES.UPDATE;
  const { summary, changes } = parseLog(log.description);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            {cfg.label}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {summary}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {formatDateTime(log.createdAt)}
            </div>
          </div>

          {changes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {changes.length === 1
                  ? "Change"
                  : `Changes (${changes.length})`}
              </h4>
              {changes.map((c, i) => {
                const isChange = c.from !== null && c.to !== null;
                const isCreate = c.from === null && c.to !== null;
                const isDelete = c.from !== null && c.to === null;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700/60">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        {c.field}
                      </span>
                    </div>
                    {isChange && (
                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700/60">
                        <div className="p-4 bg-red-50/50 dark:bg-red-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
                            Before
                          </p>
                          <ValueChip value={c.from!} field={c.field} />
                        </div>
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">
                            After
                          </p>
                          <ValueChip value={c.to!} field={c.field} />
                        </div>
                      </div>
                    )}
                    {isCreate && (
                      <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-2">
                          Set to
                        </p>
                        <ValueChip value={c.to!} field={c.field} />
                      </div>
                    )}
                    {isDelete && (
                      <div className="p-4 bg-red-50/30 dark:bg-red-950/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2">
                          Deleted
                        </p>
                        <ValueChip value={c.from!} field={c.field} />
                      </div>
                    )}
                  </div>
                );
              })}
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
