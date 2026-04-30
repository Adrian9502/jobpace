import { getApplications } from "@/lib/queries";
import CalendarClient from "@/components/CalendarClient";

export const metadata = {
  title: "Interview Calendar - JobPace",
};

export default async function CalendarPage() {
  const applications = await getApplications();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Interview Calendar
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Keep track of your scheduled interviews and assessments.
        </p>
      </div>
      <CalendarClient applications={applications} />
    </>
  );
}
