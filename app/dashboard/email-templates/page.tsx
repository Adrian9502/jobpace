import EmailTemplates from "@/components/EmailTemplates";

export const metadata = {
  title: "Email Templates - JobPace",
};

export default function EmailTemplatesPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Email Templates
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Professional templates to help you communicate effectively with
          recruiters.
        </p>
      </div>
      <EmailTemplates />
    </>
  );
}
