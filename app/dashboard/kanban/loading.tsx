import { Skeleton } from "@/components/ui/Skeleton";

export default function KanbanLoading() {
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-80 flex flex-col gap-4">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>

              {/* Column Content (Cards) */}
              <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-3 space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
