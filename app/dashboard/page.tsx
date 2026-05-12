import { getSession } from "@/lib/auth-helpers";
import {
  getApplicationStats,
  getKanbanCounts,
  getApplications,
} from "@/lib/queries";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import KanbanPreview from "@/components/dashboard/KanbanPreview";
import RecentApplications from "@/components/dashboard/RecentApplications";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [stats, kanbanCounts, applications] = await Promise.all([
    getApplicationStats(),
    getKanbanCounts(),
    getApplications(),
  ]);

  return (
    <>
      <WelcomeHeader firstName={firstName} />
      <StatsGrid
        total={stats.total}
        interviews={stats.interviews}
        offers={stats.offers}
        followUpsDue={stats.followUpsDue}
      />
      <KanbanPreview kanbanCounts={kanbanCounts} applications={applications} />
      <RecentApplications applications={applications.slice(0, 5)} />
    </>
  );
}
