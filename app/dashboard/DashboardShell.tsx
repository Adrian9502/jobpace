import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { Analytics } from "@vercel/analytics/next";
import { getUpcomingReminders } from "@/lib/queries/notifications";
import { db } from "@/lib/db";
import JobPaceAIWidget from "@/components/ai/JobPaceAIWidget";

export default async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = await getSession();

  if (!isDev && !session?.user) redirect("/");

  // Safely get user ID if session exists
  const userId = session?.user?.id;
  const upcomingReminders = userId ? await getUpcomingReminders(userId, db) : [];
  const remindersCount = upcomingReminders.filter(r => r.isActive).length;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        userName={session!.user!.name ?? "User"}
        userImage={session!.user!.image}
        remindersCount={remindersCount}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <div className="h-8 lg:hidden shrink-0" />
        <main className="flex-1 p-6 pt-14 lg:pt-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <Analytics />
      <JobPaceAIWidget />
    </div>
  );
}
