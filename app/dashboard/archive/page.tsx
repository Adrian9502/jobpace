import { getApplications } from "@/lib/queries";
import ArchiveClient from "@/components/ArchiveClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Archive - JobPace",
};

export default async function ArchivePage() {
  const applications = await getApplications();

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      <ArchiveClient applications={applications} />
    </div>
  );
}
