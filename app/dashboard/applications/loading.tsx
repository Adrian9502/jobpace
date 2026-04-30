import { Skeleton } from "@/components/ui/Skeleton";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Filters & Search Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-800/50"
                >
                  <td className="px-4 py-3.5">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16 mt-2" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Skeleton className="h-7 w-20 ml-auto rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
