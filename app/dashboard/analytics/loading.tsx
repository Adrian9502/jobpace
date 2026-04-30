import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-44 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm"
          >
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-10 mt-2" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm"
          >
            <Skeleton className="h-4 w-40 mb-5" />
            <Skeleton className="h-70 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
