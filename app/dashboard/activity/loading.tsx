import { Skeleton } from "@/components/ui/Skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
        <Skeleton className="h-4 w-24 ml-auto self-center" />
      </div>

      {/* Activity table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                {Array.from({ length: 6 }).map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <Skeleton className="h-3 w-16" />
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
                    <Skeleton className="h-3 w-6" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-56" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Skeleton className="h-7 w-20 ml-auto rounded-lg" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
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
