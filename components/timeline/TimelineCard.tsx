import { STAGE_CONFIG } from "@/lib/constants";
import type { Stage } from "@/lib/constants";
import { formatSalaryCompact, capitalizeFirst } from "@/lib/utils";
import type { ApplicationRow } from "@/lib/queries";
import StageBadge from "@/components/StageBadge";
import StatusBadge from "@/components/StatusBadge";
import Tag from "./Tag";
import { getStatusNote, STATUS_NOTE_STYLE } from "@/utils/timeline";

export default function TimelineCard({ app }: { app: ApplicationRow }) {
  const stageCfg = STAGE_CONFIG[app.stage as Stage] ?? STAGE_CONFIG.applied;
  const d = new Date(app.dateApplied);
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const sal = formatSalaryCompact(app.salaryMin, app.salaryMax);
  const noteStyle =
    STATUS_NOTE_STYLE[app.stage] ?? "text-zinc-400 dark:text-zinc-500";

  return (
    <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="px-4 pt-4 pb-3">
        {/* Mobile date + dot */}
        <div className="flex items-center gap-2 mb-2 sm:hidden">
          <div className={`w-2 h-2 rounded-full shrink-0 ${stageCfg.dot}`} />
          <span className="text-xs font-bold text-zinc-500">
            {mon} {day}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] leading-snug truncate">
              {app.position}
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {app.companyName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StageBadge stage={app.stage} />
            <StatusBadge status={app.status} />
          </div>
        </div>
      </div>

      {(app.source || app.location || app.workSetup || sal !== "—") && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {app.source && <Tag icon="source">{app.source}</Tag>}
          {app.location && <Tag icon="pin">{app.location}</Tag>}
          {app.workSetup && (
            <Tag icon="screen">{capitalizeFirst(app.workSetup)}</Tag>
          )}
          {sal !== "—" && (
            <Tag icon="money" green>
              {sal}
            </Tag>
          )}
        </div>
      )}

      <div
        className={`px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 text-xs font-medium ${noteStyle}`}
      >
        {getStatusNote(app.stage, app.status, app.followUpDate)}
      </div>
    </div>
  );
}
