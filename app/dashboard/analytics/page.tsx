import { getApplications } from "@/lib/queries";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics - JobPace" };

export default async function AnalyticsPage() {
  const applications = await getApplications();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics Insights</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Visual breakdown of your job search performance and trends.
        </p>
      </div>

      <AnalyticsCharts applications={applications} />
    </>
  );
}
