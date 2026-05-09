import { getUserId, getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import SettingsClient from "@/components/settings/SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings - JobPace" };

export default async function SettingsPage() {
  const userId = await getUserId();
  const session = await getSession();

  // Fetch the full user row for settings
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const profileData = {
    name: user?.name || session?.user?.name || "",
    email: user?.email || session?.user?.email || "",
    username: user?.username || "",
    image: user?.image || session?.user?.image || null,
  };

  const emailPreferences = {
    notifyInterview: user?.notifyInterview ?? true,
    notifyFollowUp: user?.notifyFollowUp ?? true,
    notifyStale: user?.notifyStale ?? true,
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Settings
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your profile and notification preferences.
        </p>
      </div>

      <SettingsClient
        profile={profileData}
        emailPreferences={emailPreferences}
      />
    </>
  );
}
