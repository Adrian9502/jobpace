import { auth } from "@/lib/auth";
import { DEV_USER } from "@/lib/dev-auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? DEV_USER : await auth();

  if (!isDev && !session?.user) redirect("/");

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        userName={session!.user!.name ?? "User"}
        userImage={session!.user!.image}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-14 flex items-center px-6 lg:px-6 pl-14 lg:pl-6 shrink-0 transition-colors">
          <h1 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
        </header> */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}