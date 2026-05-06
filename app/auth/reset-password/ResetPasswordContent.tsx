"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { resetPassword } from "@/lib/actions/auth.actions";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import PasswordRequirements from "@/components/ui/PasswordRequirements";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { password, setPassword, validation } = usePasswordValidation();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid reset link</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">
              This password reset link is missing or invalid. Please request a new one.
            </p>
            <Link href="/auth/forgot-password" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Request a new reset link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    formData.set("token", token);

    try {
      const result = await resetPassword(formData);

      if (result.success) {
        toast.success("Password reset successfully!");
        router.push("/?reset=true");
        return;
      }

      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error) setFormError(result.error);
    } catch {
      setFormError("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
              <Image src="/jobpace-logo-blue.png" alt="JobPace" width={40} height={40} className="rounded-lg shadow-sm pointer-events-none" priority />
              <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-white">JobPace</span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set a new password</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Enter your new password below.</p>
          </div>

          {formError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{formError}</p>
            </div>
          )}

          <form action={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                  New Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hasError={!!fieldErrors.password}
                />
                {fieldErrors.password?.map((e, i) => (
                  <p key={i} className="mt-1.5 text-xs text-red-500 dark:text-red-400">{e}</p>
                ))}
                {password.length > 0 && (
                  <PasswordRequirements
                    validation={validation}
                  />
                )}
              </div>



              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </div>
                ) : "Reset Password"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}