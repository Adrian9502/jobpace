import { getApplications } from "@/lib/queries";
import KanbanBoard from "@/components/KanbanBoard";
import AddApplicationButton from "@/components/AddApplicationButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kanban Board - JobPace",
};

export default async function KanbanPage() {
  const applications = await getApplications();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Track Progress
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Drag and drop applications to quickly update their phase.
          </p>
        </div>
        <AddApplicationButton />
      </div>
      
      <KanbanBoard initialApplications={applications} />
    </>
  );
}
