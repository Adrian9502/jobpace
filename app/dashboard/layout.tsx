import { Suspense } from "react";
import DashboardShell from "./DashboardShell";
import DashboardLoading from "./loading";
import { Skeleton } from "@/components/ui/Skeleton";

function DashboardShellFallback() {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="hidden lg:flex w-56 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 gap-3">
        <Skeleton className="h-6 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-md" />
          ))}
        </div>
        <div className="mt-auto">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <main className="flex-1 p-6 overflow-y-auto">
          <DashboardLoading />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardShellFallback />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
