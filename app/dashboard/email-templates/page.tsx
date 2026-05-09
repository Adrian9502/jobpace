import EmailTemplates from "@/components/EmailTemplates";
import { getApplications } from "@/lib/queries";
import { getSession } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Email Templates - JobPace",
};

export default async function EmailTemplatesPage() {
  const [applications, session] = await Promise.all([
    getApplications(),
    getSession()
  ]);

  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

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
      <EmailTemplates applications={applications} userName={userName} userEmail={userEmail} />
    </>
  );
}
