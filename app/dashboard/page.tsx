import { getSession } from "@/lib/auth-helpers";
import {
  getApplicationStats,
  getKanbanCounts,
  getApplications,
} from "@/lib/queries";
import { STAGE_CONFIG, STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import AddApplicationButton from "@/components/AddApplicationButton";
import LiveDateTime from "@/components/LiveDateTime";
import StatusBadge from "@/components/StatusBadge";
import StageBadge from "@/components/StageBadge";
import StageStatusGuide from "@/components/StageStatusGuide";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  // Fetch real data
  const [stats, kanbanCounts, applications] = await Promise.all([
    getApplicationStats(),
    getKanbanCounts(),
    getApplications(),
  ]);

  const recentApps = applications.slice(0, 5);

  // Show a subset of stages for the Kanban preview
  const previewStages = ["applied", "screening", "interview", "assessment", "offer", "hired"] as const;

  return (
    <>
      {/* Welcome */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Here&apos;s a summary of your job search journey.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveDateTime />
          <AddApplicationButton />
        </div>
      </div>
      

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { 
            label: "Total Applied", 
            value: String(stats.total), 
            sub: "applications",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-500 dark:text-zinc-400">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            ),
            colorClass: "text-zinc-900 dark:text-zinc-100"
          },
          {
            label: "Interviews",
            value: String(stats.interviews),
            sub: "scheduled",
            colorClass: "text-blue-600 dark:text-blue-400",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600 dark:text-blue-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            )
          },
          { 
            label: "Offers", 
            value: String(stats.offers), 
            sub: "received", 
            colorClass: "text-emerald-600 dark:text-emerald-400",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-600 dark:text-emerald-400">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            )
          },
          {
            label: "Follow-ups Due",
            value: String(stats.followUpsDue),
            sub: "this week",
            colorClass: "text-amber-600 dark:text-amber-400",
            href: "/dashboard/reminders",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-600 dark:text-amber-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            )
          },
        ].map((stat) => {
          const content = (
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-3.5 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-1.5">
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {stat.label}
                </div>
                {stat.icon}
              </div>
              <div
                className={`text-2xl font-semibold mt-auto ${stat.colorClass}`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.sub}</div>
            </div>
          );

          return stat.href ? (
            <a key={stat.label} href={stat.href} className="flex flex-col">
              {content}
            </a>
          ) : (
            <div key={stat.label} className="flex flex-col">
              {content}
            </div>
          );
        })}
      </div>

      {/* Kanban preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Kanban Board</h3>
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
          {previewStages.map((stage) => {
            const count = kanbanCounts[stage] ?? 0;
            const cfg = STAGE_CONFIG[stage];
            return (
              <div key={stage} className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3 border border-transparent dark:border-zinc-800">
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

      {/* Recent applications */}
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
          <div className="grid grid-cols-5 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            <div>Company / Role</div>
            <div>Date Applied</div>
            <div>Stage</div>
            <div>Status</div>
            <div>Source</div>
          </div>

          {recentApps.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">No applications yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Add your first application to get started
              </p>
            </div>
          ) : (
            <div>
              {recentApps.map((app, idx) => (
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
    </>
  );
}
