import { getApplications, getDocuments } from "@/lib/queries";
import ArchiveClient from "@/components/archive/ArchiveClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Archive - JobPace",
};

export default async function ArchivePage() {
  const [applications, documents] = await Promise.all([
    getApplications(),
    getDocuments(),
  ]);

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
      <ArchiveClient applications={applications} documents={documents} />
    </div>
  );
}
