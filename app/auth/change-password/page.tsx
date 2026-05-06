import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Check if user has a password set
  const [user] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const hasPassword = !!user?.password;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <ChangePasswordForm hasPassword={hasPassword} />
    </div>
  );
}
