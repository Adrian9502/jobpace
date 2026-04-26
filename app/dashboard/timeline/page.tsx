import DashboardLayout from "@/components/DashboardLayout";
import { getApplications } from "@/lib/actions";
import TimelineClient from "@/components/TimelineClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Job Hunt Timeline - JobPace" };

export default async function TimelinePage() {
  const applications = await getApplications();

  return (
    <DashboardLayout title="Job Hunt Timeline">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Job Hunt Timeline</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          A chronological mapping of all your applications over time.
        </p>
      </div>

      <TimelineClient applications={applications} />
    </DashboardLayout>
  );
}
