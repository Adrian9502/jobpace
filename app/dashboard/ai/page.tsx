import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import AiChatClient from "@/components/ai/AiChatClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Assistant - JobPace" };

export default async function AiPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          AI Assistant
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Chat with your job search data. Ask questions, update applications,
          and get advice.
        </p>
      </div>

      <AiChatClient />
    </>
  );
}
