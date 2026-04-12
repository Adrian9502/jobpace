import DashboardLayout from "@/components/DashboardLayout";
import ApplicationsClient from "@/components/ApplicationsClient";
import { getApplications } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <DashboardLayout title="Applications">
      <ApplicationsClient applications={JSON.parse(JSON.stringify(applications))} />
    </DashboardLayout>
  );
}
