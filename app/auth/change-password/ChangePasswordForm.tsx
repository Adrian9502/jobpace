"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/auth.actions";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import PasswordRequirements from "@/components/ui/PasswordRequirements";
import PasswordInput from "@/components/ui/PasswordInput";

interface Props {
  hasPassword: boolean;
}

export default function ChangePasswordForm({ hasPassword }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const {
    password: newPassword,
    setPassword: setNewPassword,
    validation,
  } = usePasswordValidation();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const result = await changePassword(formData);

      if (result.success) {
        toast.success(hasPassword ? "Password updated!" : "Password set!");
        const form = document.querySelector("form") as HTMLFormElement;
        form?.reset();
        setNewPassword("");
      } else {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.error) setFormError(result.error);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/jobpace-logo-blue.png" alt="JobPace" width={28} height={28} className="rounded-lg shadow-sm pointer-events-none" />
          <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-white">JobPace</span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {hasPassword ? "Change your password" : "Set a password"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {hasPassword
              ? "Enter your current password and choose a new one."
              : "You signed up with Google. Set a password to also sign in with email."}
          </p>
        </div>

        {/* Form error */}
        {formError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-sm text-red-700 dark:text-red-300">{formError}</p>
          </div>
        )}

        <form action={handleSubmit}>
          <div className="flex flex-col gap-4">

            {/* Current Password */}
            {hasPassword && (
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  id="currentPassword"
                  name="currentPassword"
                  required
                  maxLength={72}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  hasError={!!fieldErrors.currentPassword}
                />
                {fieldErrors.currentPassword?.map((e, i) => (
                  <p key={i} className="mt-1.5 text-xs text-red-500 dark:text-red-400">{e}</p>
                ))}
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                New Password
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                required
                maxLength={72}
                autoComplete="new-password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                hasError={!!fieldErrors.newPassword}
              />
              {newPassword.length > 0 && (
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
                  <span>{hasPassword ? "Updating..." : "Setting password..."}</span>
                </div>
              ) : hasPassword ? "Update Password" : "Set Password"}
            </button>
          </div>
        </form>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}