import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingContent from "@/components/landing/LandingContent";

export default async function Home() {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? null : await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingContent />;
}