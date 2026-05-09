import { getApplications } from "@/lib/queries";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import AddApplicationButton from "@/components/ui/AddApplicationButton";
import StageStatusGuide from "@/components/ui/StageStatusGuide";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kanban Board - JobPace",
};

export default async function KanbanPage() {
  const applications = await getApplications();

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: title + guide button */}
        <div className="flex items-start gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Track Progress
              </h2>
              <StageStatusGuide />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Drag and drop applications to quickly update their stage.
            </p>
          </div>
        </div>

        {/* Right: add button */}
        <div className="shrink-0">
          <AddApplicationButton />
        </div>
      </div>

      <KanbanBoard initialApplications={applications} />
    </>
  );
}
