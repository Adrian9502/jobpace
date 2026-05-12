import { STAGE_CONFIG, KANBAN_COLUMNS } from "@/lib/constants";
import StageStatusGuide from "@/components/ui/StageStatusGuide";
import type { ApplicationRow } from "@/lib/queries";

interface Props {
  kanbanCounts: Record<string, number>;
  applications: ApplicationRow[];
}

export default function KanbanPreview({ kanbanCounts, applications }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Kanban Board
          </h3>
          <StageStatusGuide />
        </div>
        <a
          href="/dashboard/kanban"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {KANBAN_COLUMNS.map((stage) => {
          const count = kanbanCounts[stage] ?? 0;
          const cfg = STAGE_CONFIG[stage];
          return (
            <div
              key={stage}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 border border-transparent dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {cfg.label}
                  </span>
                </div>
                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              </div>

              {count === 0 ? (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900/50 p-2.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No applications yet
                </div>
              ) : (
                <div className="space-y-1.5">
                  {applications
                    .filter((a) => a.stage === stage)
                    .slice(0, 2)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="bg-white dark:bg-zinc-950 rounded p-2 border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {app.companyName}
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 truncate">
                          {app.position}
                        </div>
                      </div>
                    ))}
                  {count > 2 && (
                    <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                      +{count - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
