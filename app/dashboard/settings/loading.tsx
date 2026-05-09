import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      <div className="space-y-8 max-w-2xl">
        {/* Profile Section */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-5 shadow-sm">
            {/* Avatar Row */}
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40 mt-1.5" />
              </div>
            </div>
            {/* Two-column fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-24 mb-1.5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1.5" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            {/* Email Field */}
            <div>
              <Skeleton className="h-3 w-12 mb-1.5" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-64 mt-1" />
            </div>
            {/* Save Button */}
            <div className="flex justify-end">
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2">
                <div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-56 mt-1.5" />
                </div>
                <Skeleton className="w-11 h-6 rounded-full shrink-0" />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
