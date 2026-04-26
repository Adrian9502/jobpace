import ApplicationsClient from "@/components/ApplicationsClient";
import { getApplications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return (
    <ApplicationsClient applications={JSON.parse(JSON.stringify(applications))} />
  );
}
