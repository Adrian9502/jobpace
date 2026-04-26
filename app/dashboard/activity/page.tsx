import { getActivityLogs } from "@/lib/queries";
import ActivityClient from "@/components/ActivityClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity Logs - JobPace" };

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  // Serialize dates to plain objects for the client component
  const serializedLogs = logs.map((log) => ({
    id: log.id,
    actionType: log.actionType,
    description: log.description,
    applicationId: log.applicationId ?? null,
    createdAt: log.createdAt ? log.createdAt.toISOString() : null,
  }));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Activity Logs
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          A chronological trail of all modifications made to your job tracking
          data.
        </p>
      </div>

      <ActivityClient logs={serializedLogs} />
    </>
  );
}
