import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = await getSession();

  if (!isDev && !session?.user) redirect("/");

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        userName={session!.user!.name ?? "User"}
        userImage={session!.user!.image}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
