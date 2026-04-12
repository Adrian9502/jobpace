import DashboardLayout from "@/components/DashboardLayout";
import { getApplications } from "@/lib/actions";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kanban Board - JobPace",
};

export default async function KanbanPage() {
  const applications = await getApplications();

  return (
    <DashboardLayout title="Kanban Board">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#172B4D]">
            Track Progress
          </h2>
          <p className="text-sm text-[#5E6C84] mt-1">
            Drag and drop applications to quickly update their phase.
          </p>
        </div>
      </div>
      
      <KanbanBoard initialApplications={applications} />
    </DashboardLayout>
  );
}
