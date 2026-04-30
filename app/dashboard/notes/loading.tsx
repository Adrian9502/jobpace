import { Skeleton } from "@/components/ui/Skeleton";

export default function NotesLoading() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-140px)]">
      <div className="flex h-full bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="p-3 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Editor Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
          <div className="p-12 max-w-3xl mx-auto w-full space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
