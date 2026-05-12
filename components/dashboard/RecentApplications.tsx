import { formatDate } from "@/lib/utils";
import StageBadge from "@/components/ui/StageBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationRow } from "@/lib/queries";

interface Props {
  applications: ApplicationRow[];
}

export default function RecentApplications({ applications }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Applications
        </h3>
        <a
          href="/dashboard/applications"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all
        </a>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-5 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              <div>Company / Role</div>
              <div>Date Applied</div>
              <div>Stage</div>
              <div>Status</div>
              <div>Source</div>
            </div>

            {applications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  No applications yet
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Add your first application to get started
                </p>
              </div>
            ) : (
              <div>
                {applications.map((app, idx) => (
                  <div
                    key={app.id}
                    className={`grid grid-cols-5 px-4 py-3 items-center text-sm border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 ${
                      idx % 2 === 0 ? "" : "bg-zinc-50/50 dark:bg-zinc-900/50"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {app.companyName}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {app.position}
                      </div>
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {formatDate(app.dateApplied)}
                    </div>
                    <div>
                      <StageBadge stage={app.stage} />
                    </div>
                    <div>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {app.source || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
