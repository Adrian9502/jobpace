import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

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
          { label: "Total Applied", value: "0", sub: "applications" },
          {
            label: "Interviews",
            value: "0",
            sub: "scheduled",
            color: "#0052CC",
          },
          { label: "Offers", value: "0", sub: "received", color: "#006644" },
          {
            label: "Follow-ups Due",
            value: "0",
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
          {["Applied", "Interview", "Offer", "Hired"].map((stage) => (
            <div key={stage} className="bg-[#F4F5F7] rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide">
                  {stage}
                </span>
                <span className="bg-[#DFE1E6] text-[#5E6C84] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  0
                </span>
              </div>
              <div className="border border-dashed border-[#DFE1E6] rounded bg-white p-2.5 text-center text-[11px] text-[#B3BAC5]">
                No applications yet
              </div>
            </div>
          ))}
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
          <div className="px-4 py-8 text-center text-sm text-[#5E6C84]">
            <p className="text-3xl mb-2">📋</p>
            <p className="font-medium text-[#172B4D]">No applications yet</p>
            <p className="text-xs text-[#97A0AF] mt-1">
              Add your first application to get started
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
