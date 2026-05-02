import { Skeleton } from "@/components/ui/Skeleton";

export default function TimelineLoading() {
  return (
    <div className="pb-12 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* Timeline groups */}
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex}>
            {/* Month header */}
            <div className="flex items-center gap-3 py-2.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-5 rounded-full" />
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Items */}
            <div className="mt-4 relative space-y-4">
              <div className="absolute top-3 bottom-3 left-18 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

              {Array.from({ length: 3 }).map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  className="relative flex gap-4 sm:gap-5 items-start"
                >
                  {/* Date column */}
                  <div className="hidden sm:flex flex-col items-end w-16 shrink-0 pt-3.5 gap-1">
                    <Skeleton className="h-2.5 w-7" />
                    <Skeleton className="h-5 w-5" />
                  </div>

                  {/* Dot */}
                  <div className="hidden sm:flex relative z-10 mt-4 w-5 h-5 shrink-0 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-950 ring-4 ring-zinc-50 dark:ring-zinc-950 border border-zinc-200 dark:border-zinc-700">
                    <Skeleton className="w-2 h-2 rounded-full" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                    {/* Card top */}
                    <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-14 rounded-full" />
                      </div>
                    </div>

                    {/* Tags row */}
                    <div className="px-4 pb-3 flex gap-1.5">
                      {Array.from({ length: 3 }).map((_, chipIndex) => (
                        <Skeleton
                          key={chipIndex}
                          className="h-5 w-20 rounded-md"
                        />
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
