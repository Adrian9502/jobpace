import { getUpcomingReminders, getNotificationHistory } from "@/lib/queries/notifications";
import { getUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import RemindersClient from "@/components/reminders/RemindersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reminders - JobPace" };

export default async function RemindersPage() {
  const userId = await getUserId();
  const [upcoming, history] = await Promise.all([
    getUpcomingReminders(userId, db),
    getNotificationHistory(userId, db),
  ]);

  const serializedUpcoming = upcoming.map((item) => ({
    ...item,
    date: item.date.toISOString(),
  }));

  const serializedHistory = history.map((item) => ({
    ...item,
    sentAt: item.sentAt ? item.sentAt.toISOString() : null,
  }));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Reminders
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Keep track of your upcoming interviews, due follow-ups, and applications that need an update.
        </p>
      </div>

      <RemindersClient upcoming={serializedUpcoming} history={serializedHistory} />
    </>
  );
}
