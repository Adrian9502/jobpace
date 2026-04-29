import { getApplications } from "@/lib/queries";
import CalendarClient from "@/components/CalendarClient";

export const metadata = {
  title: "Interview Calendar | JobPace",
  description: "View and manage your scheduled interviews.",
};

export default async function CalendarPage() {
  const applications = await getApplications();

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CalendarClient applications={applications} />
    </div>
  );
}
