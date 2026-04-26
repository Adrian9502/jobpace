import DashboardLayout from "@/components/DashboardLayout";
import { getActivityLogs } from "@/lib/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity Logs - JobPace" };

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateHeader(dateString: string): string {
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getActionConfig(actionType: string) {
  switch (actionType) {
    case "CREATE":
      return {
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm-.75 3.5h1.5v2h2v1.5h-2v2h-1.5v-2h-2v-1.5h2v-2z" />
          </svg>
        ),
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        ring: "ring-blue-50 dark:ring-blue-950/50",
      };
    case "STATUS_CHANGE":
      return {
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M2.5 10.5V13h2.5l7.3-7.3-2.5-2.5-7.3 7.3zM14.3 4.5l-1.8-1.8-1 1 2.5 2.5 1-1A.7.7 0 0014.3 4.5z" />
          </svg>
        ),
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
        ring: "ring-amber-50 dark:ring-amber-950/50",
      };
    case "DELETE":
      return {
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M3.5 5h9M6 5v8h4V5M4.5 5l.5 8h6l.5-8" />
          </svg>
        ),
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-500 dark:text-red-400",
        ring: "ring-red-50 dark:ring-red-950/50",
      };
    case "UPDATE":
    default:
      return {
        icon: (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2zM8 12H5v-1h3v1zm4-3H5V8h7v1zm-2-4V2.5L12.5 5H10z" />
          </svg>
        ),
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-600 dark:text-emerald-400",
        ring: "ring-emerald-50 dark:ring-emerald-950/50",
      };
  }
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default async function TimelinePage() {
  const logs = await getActivityLogs();

  // Group logs by day
  const groupedLogs: Record<string, typeof logs> = {};
  logs.forEach((log) => {
    // Treat date as local PH string
    const dateKey = log.createdAt!.toDateString();
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
    groupedLogs[dateKey].push(log);
  });

  return (
    <DashboardLayout title="Activity Logs">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Activity Logs</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          A chronological trail of all modifications made to your job tracking data.
        </p>
      </div>

      <div className="max-w-3xl">
        {logs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-500 dark:text-zinc-400 shadow-sm">
            <p className="text-4xl mb-3">🕒</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">No activity yet</p>
            <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">Actions you make on your Dashboard will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLogs).map(([dateKey, dayLogs]) => (
              <div key={dateKey}>
                <div className="sticky top-0 z-10 py-2 bg-zinc-50 dark:bg-zinc-950 transition-colors">
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {formatDateHeader(dateKey)}
                  </h3>
                </div>
                
                <div className="relative pl-3 mt-4 space-y-6 before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-white dark:before:bg-zinc-800 before:rounded-full">
                  {dayLogs.map((log) => {
                    const cfg = getActionConfig(log.actionType);
                    return (
                      <div key={log.id} className="relative flex gap-4 pr-4">
                        {/* Dot indicator */}
                        <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ${cfg.ring} ${cfg.bg} ${cfg.text} shadow-sm`}>
                          {cfg.icon}
                        </div>
                        
                        {/* Content block */}
                        <div className="flex-1 py-1.5 flex justify-between gap-4">
                          <div className="text-sm text-zinc-900 dark:text-zinc-100">
                            {log.description}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 font-medium bg-white dark:bg-zinc-900 px-2 py-0.5 rounded shadow-sm border border-zinc-200 dark:border-zinc-800">
                            {formatTime(log.createdAt!)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
