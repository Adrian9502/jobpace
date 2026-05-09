import { Clock } from "lucide-react";
import { ACTION_TYPES } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { parseLog } from "@/types/activity-parser";
import ActionBadge from "./ActionBadge";
import type { ActivityLog } from "@/types/activity";

export default function ActivityLogItem({
  log,
  onViewDetails,
}: {
  log: ActivityLog;
  onViewDetails: () => void;
}) {
  const { summary } = parseLog(log.description);
  const cfg = ACTION_TYPES[log.actionType] ?? ACTION_TYPES.UPDATE;

  return (
    <div className="relative pl-6 md:pl-8">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 ${cfg.bg} flex items-center justify-center`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700/50 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors shadow-sm space-y-3">
        {/* Badge + date */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionBadge actionType={log.actionType} />
          <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {formatDate(log.createdAt)} at {formatTime(log.createdAt)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
          {summary}
        </p>

        {/* Bottom: View Details */}
        <div className="pt-2 border-t items-center justify-center border-zinc-100 dark:border-zinc-700/50 flex">
          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
