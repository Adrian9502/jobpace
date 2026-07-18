import ApplicationsClient from "@/components/application/ApplicationsClient";
import { getApplications, getDocuments } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Applications - JobPace",
};
export default async function ApplicationsPage() {
  const [applications, documents] = await Promise.all([
    getApplications(),
    getDocuments(),
  ]);

  return (
    <ApplicationsClient applications={applications} documents={documents} />
  );
}
