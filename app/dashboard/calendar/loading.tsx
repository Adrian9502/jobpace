import { Skeleton } from "@/components/ui/Skeleton";

export default function CalendarLoading() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Month Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Calendar Grid Skeleton */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 py-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-8 mx-auto" />
            ))}
          </div>
          <div className="grid grid-cols-7">
            {[...Array(35)].map((_, i) => (
              <div
                key={i}
                className="min-h-20 p-2 border-b border-r border-zinc-100 dark:border-zinc-800/50 space-y-2"
              >
                <Skeleton className="h-5 w-5 rounded-full" />
                {i % 7 === 2 && <Skeleton className="h-4 w-full rounded" />}
                {i % 7 === 5 && <Skeleton className="h-4 w-full rounded" />}
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel Skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-6 space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
