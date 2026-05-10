import { getUserDocuments } from "@/app/actions/documents";
import DocumentManager from "@/components/documents/DocumentManager";

export const metadata = {
  title: "Resume & Documents - JobPace",
  description: "Manage your resumes, cover letters, and other documents.",
};

export default async function ResumeAndDocumentsPage() {
  const documents = await getUserDocuments();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Resume & Documents
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Upload and manage your resumes, CVs, and cover letters. Download them
          anytime.
        </p>
      </div>

      <DocumentManager initialDocuments={documents} />
    </div>
  );
}
