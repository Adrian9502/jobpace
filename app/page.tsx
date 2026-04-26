import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? null : await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-sm px-6 py-8 sm:px-10 sm:py-10 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        <Image
          src="/jobpace-logo-final.png"
          alt="Job Pace Logo"
          width={70}
          height={70}
          priority
          className="mb-4 h-auto pointer-events-none w-14 sm:w-[70px] dark:brightness-0 dark:invert"
        />
        <Image
          src="/jobpace-title-horizontal2.png"
          alt="Job Pace"
          width={200}
          height={46}
          priority
          className="mb-2 h-auto pointer-events-none w-36 sm:w-[200px] dark:brightness-0 dark:invert"
        />

        <div className="flex items-center gap-3 w-full mb-5 mt-2">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Sign in to continue
          </span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
        <a href="/dashboard">
          <button className="mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-semibold rounded border border-yellow-500 transition-all">
            Dev Login (local only)
          </button>
        </a>
      )}
    </div>
  );
}