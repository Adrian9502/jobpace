"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { forgotPassword } from "@/lib/actions/auth.actions";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const result = await forgotPassword(formData);

      if (result.success) {
        setIsSuccess(true);
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
         <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-50">
        <ThemeToggle />
      </div>
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-sm">
          {/* Logo */}
           <div className="flex items-center justify-center gap-2 mb-8">
              <Image src="/jobpace-logo-blue.png" alt="JobPace" width={40} height={40} className="rounded-lg shadow-sm pointer-events-none" priority />
              <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-white">JobPace</span>
          </div>

          {isSuccess ? (
            /* Success State */
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Check your email
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
                If an account with that email exists, we&apos;ve sent a password
                reset link. The link will expire in <strong>30 minutes</strong>.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-1.5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to sign in
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Forgot your password?
                </h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {formError && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {formError}
                  </p>
                </div>
              )}

              <form action={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength={255}
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                      fieldErrors.email
                        ? "border-red-400 dark:border-red-600"
                        : "border-gray-200 dark:border-zinc-700"
                    }`}
                  />
                  {fieldErrors.email?.map((e, i) => (
                    <p
                      key={i}
                      className="mt-1.5 text-xs text-red-500 dark:text-red-400"
                    >
                      {e}
                    </p>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-1.5"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
