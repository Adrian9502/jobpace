import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingContent from "@/components/landing/LandingContent";

export default async function Home() {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? null : await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}