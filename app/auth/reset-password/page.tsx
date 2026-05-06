import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
       <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-50">
        <ThemeToggle />
      </div>
      <ResetPasswordContent />
    </Suspense>
  );
}
