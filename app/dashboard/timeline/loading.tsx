import { Skeleton } from "@/components/ui/Skeleton";

export default function TimelineLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <div className="max-w-4xl mx-auto pb-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* Timeline groups */}
        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex}>
              <div className="sticky top-0 z-10 py-3 bg-zinc-50 dark:bg-zinc-950">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="mt-4 relative space-y-6">
                <div className="absolute top-0 bottom-0 left-16 w-0.5 bg-zinc-200 dark:bg-zinc-800 hidden sm:block rounded" />
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                  >
                    <div className="sm:w-12 pt-1.5 shrink-0 sm:text-right hidden sm:block">
                      <Skeleton className="h-3 w-8 ml-auto" />
                      <Skeleton className="h-4 w-6 ml-auto mt-1" />
                    </div>
                    <div className="relative z-10 sm:mt-1.5 hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-900 ring-4 ring-zinc-50 dark:ring-zinc-950 border border-zinc-200 dark:border-zinc-700">
                      <Skeleton className="h-2 w-2 rounded-full" />
                    </div>
                    <div className="flex-1 w-full relative">
                      <div className="flex items-center gap-2 mb-2 sm:hidden pl-1">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <div className="flex flex-col gap-1.5 items-end shrink-0">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {Array.from({ length: 3 }).map((_, chipIndex) => (
                            <Skeleton
                              key={chipIndex}
                              className="h-6 w-24 rounded"
                            />
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                      </div>
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
