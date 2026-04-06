import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar
        userName={session.user.name ?? "User"}
        userImage={session.user.image}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-[#DFE1E6] h-13 flex items-center px-6 lg:px-6 pl-14 lg:pl-6 shrink-0">
          <h1 className="text-[15px] font-semibold text-[#172B4D]">{title}</h1>
        </header>
        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
