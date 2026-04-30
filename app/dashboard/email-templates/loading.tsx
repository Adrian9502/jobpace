import { Skeleton } from "@/components/ui/Skeleton";

export default function EmailTemplatesLoading() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-44 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900 shadow-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
