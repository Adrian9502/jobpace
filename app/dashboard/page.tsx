import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/lib/auth";
import { DEV_USER } from "@/lib/dev-auth";
import { redirect } from "next/navigation";
import {
  getApplicationStats,
  getKanbanCounts,
  getApplications,
} from "@/lib/actions";

export const dynamic = "force-dynamic";

// ──────────────────────────────────────────────
// Status badge config (matches ApplicationsClient)
// ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  applied: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  interview: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  exam: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  offer: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  hired: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-600" },
  rejected: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  ghosted: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function DashboardPage() {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? DEV_USER : await auth();

  if (!isDev && !session?.user) redirect("/");

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  // Fetch real data
  const [stats, kanbanCounts, applications] = await Promise.all([
    getApplicationStats(),
    getKanbanCounts(),
    getApplications(),
  ]);

  const recentApps = applications.slice(0, 5);

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#172B4D]">
          Welcome back, {firstName} 👋
        </h2>
        <p className="text-sm text-[#5E6C84] mt-1">
          Here&apos;s a summary of your job search journey.
        </p>
      </div>
      

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Applied", value: String(stats.total), sub: "applications" },
          {
            label: "Interviews",
            value: String(stats.interviews),
            sub: "scheduled",
            color: "#0052CC",
          },
          { label: "Offers", value: String(stats.offers), sub: "received", color: "#006644" },
          {
            label: "Follow-ups Due",
            value: String(stats.followUpsDue),
            sub: "this week",
            color: "#974F0C",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#DFE1E6] rounded-md px-4 py-3.5"
          >
            <div className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide mb-1.5">
              {stat.label}
            </div>
            <div
              className="text-2xl font-semibold"
              style={{ color: stat.color ?? "#172B4D" }}
            >
              {stat.value}
            </div>
            <div className="text-[11px] text-[#5E6C84] mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Kanban preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#172B4D]">Kanban Board</h3>
          <a
            href="/dashboard/kanban"
            className="text-xs text-[#0052CC] hover:underline"
          >
            View all
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["applied", "interview", "offer", "hired"].map((stage) => {
            const count = kanbanCounts[stage] ?? 0;
            return (
              <div key={stage} className="bg-[#F4F5F7] rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide">
                    {capitalizeFirst(stage)}
                  </span>
                  <span className="bg-[#DFE1E6] text-[#5E6C84] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
                {count === 0 ? (
                  <div className="border border-dashed border-[#DFE1E6] rounded bg-white p-2.5 text-center text-[11px] text-[#B3BAC5]">
                    No applications yet
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {applications
                      .filter((a) => a.status === stage)
                      .slice(0, 3)
                      .map((app) => (
                        <div
                          key={app.id}
                          className="bg-white rounded p-2 border border-[#DFE1E6] text-xs"
                        >
                          <div className="font-medium text-[#172B4D] truncate">
                            {app.companyName}
                          </div>
                          <div className="text-[#5E6C84] truncate">
                            {app.position}
                          </div>
                        </div>
                      ))}
                    {count > 3 && (
                      <div className="text-center text-[10px] text-[#5E6C84] pt-1">
                        +{count - 3} more
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
          <h3 className="text-sm font-semibold text-[#172B4D]">
            Recent Applications
          </h3>
          <a
            href="/dashboard/applications"
            className="text-xs text-[#0052CC] hover:underline"
          >
            View all
          </a>
        </div>
        <div className="bg-white border border-[#DFE1E6] rounded-md overflow-hidden">
          <div className="grid grid-cols-4 px-4 py-2.5 bg-[#F4F5F7] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide">
            <div>Company / Role</div>
            <div>Date Applied</div>
            <div>Status</div>
            <div>Source</div>
          </div>

          {recentApps.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#5E6C84]">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium text-[#172B4D]">No applications yet</p>
              <p className="text-xs text-[#97A0AF] mt-1">
                Add your first application to get started
              </p>
            </div>
          ) : (
            <div>
              {recentApps.map((app, idx) => {
                const sc = STATUS_COLORS[app.status] ?? STATUS_COLORS.applied;
                return (
                  <div
                    key={app.id}
                    className={`grid grid-cols-4 px-4 py-3 items-center text-sm border-b border-[#F4F5F7] last:border-0 ${
                      idx % 2 === 0 ? "" : "bg-[#FAFBFC]"
                    }`}
                  >
                    <div>
                      <div className="font-medium text-[#172B4D] truncate">
                        {app.companyName}
                      </div>
                      <div className="text-xs text-[#5E6C84] truncate">
                        {app.position}
                      </div>
                    </div>
                    <div className="text-[#5E6C84] text-sm">
                      {formatDate(app.dateApplied)}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {capitalizeFirst(app.status)}
                      </span>
                    </div>
                    <div className="text-[#5E6C84] text-sm">
                      {app.source || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

