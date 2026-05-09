"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PolicyModal from "../PolicyModal";
import VerificationModal from "./VerificationModal";
import ThemeToggle from "../ThemeToggle";
import {
  signUpWithCredentials,
  signInWithCredentials,
  resendVerificationEmail,
} from "@/lib/actions/auth.actions";
import type { AuthActionResult } from "@/lib/actions/auth.actions";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import PasswordRequirements, {
  RequirementItem,
} from "@/components/ui/PasswordRequirements";
import PasswordInput from "../ui/PasswordInput";
import { features } from "@/utils/features";

type AuthTab = "signin" | "signup";

export default function LandingContent() {
  const searchParams = useSearchParams();
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { password, setPassword, validation } = usePasswordValidation();

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(
      () => setResendCooldown((prev) => prev - 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Show requirements when focused OR has value, signup tab only
  const showRequirements =
    activeTab === "signup" && (passwordFocused || password.length > 0);

  useEffect(() => {
    if (searchParams.get("verified") === "true")
      toast.success("Email verified! You can now sign in.");
    if (searchParams.get("reset") === "true")
      toast.success(
        "Password reset successfully! Sign in with your new password.",
      );
    const error = searchParams.get("error");
    const emailStr = searchParams.get("email");

    if (error === "invalid_token" || error === "missing_token") {
      toast.error("Invalid verification link. Please request a new one.");
      if (emailStr) {
        setUnverifiedEmail(emailStr);
        setShowVerificationNotice(true);
      }
    }
    if (error === "token_expired") {
      toast.error("Verification link has expired. Please request a new one.");
      if (emailStr) {
        setUnverifiedEmail(emailStr);
        setShowVerificationNotice(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setFieldErrors({});
    setFormError(null);
    setShowVerificationNotice(false);
    setPassword("");
    setPasswordFocused(false);
  }, [activeTab]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await nextAuthSignIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        setIsGoogleLoading(false);
        return;
      }
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      setIsGoogleLoading(false);
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleCredentialsSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    setShowVerificationNotice(false);

    try {
      let result: AuthActionResult;
      if (activeTab === "signup") {
        result = await signUpWithCredentials(formData);
        if (result.success) {
          toast.success(
            "Account created! Check your email to verify your account.",
          );
          setUnverifiedEmail(formData.get("email") as string);
          setShowVerificationNotice(true);
          setResendCooldown(60);
          setPassword("");
          setIsSubmitting(false);
          return;
        }
      } else {
        result = await signInWithCredentials(formData);
        if (result.success) {
          window.location.href = "/dashboard";
          return;
        }
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setShowVerificationNotice(true);
          setUnverifiedEmail(formData.get("email") as string);
          setIsSubmitting(false);
          return;
        }
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result.error && result.error !== "EMAIL_NOT_VERIFIED")
        setFormError(result.error);
    } catch {
      window.location.href = "/dashboard";
      return;
    }
    setIsSubmitting(false);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const result = await resendVerificationEmail(unverifiedEmail);
      if (result.success) {
        toast.success("Verification email sent! Check your inbox.");
        setResendCooldown(60);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to resend verification email.");
    }
    setIsResending(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 relative">
        <div className="absolute top-6 right-6 sm:top-10 sm:right-10 z-50">
          <ThemeToggle />
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all duration-300 ${activeTab === "signup" ? "lg:h-[700px]" : "lg:h-[640px]"}`}
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-0 bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-zinc-800"
          >
            <div className="max-w-110 mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-10 sm:mb-12">
                <Image
                  src="/jobpace-logo-blue.png"
                  alt="JobPace"
                  width={33}
                  height={33}
                  className="rounded-lg shadow-sm pointer-events-none"
                  priority
                />
                <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-white">
                  JobPace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-5 sm:mb-6">
                Your job search, <br />
                <span className="text-blue-600"> at your pace.</span>
              </h1>
              <div className="flex flex-col gap-3 sm:gap-4 text-sm sm:text-[15px] text-gray-500 dark:text-zinc-400 leading-relaxed mb-7 sm:mb-10">
                <p>
                  Applications get lost, follow-ups are forgotten, and the whole
                  process starts to feel like shouting into the void.
                </p>
                <p>
                  JobPace gives you one place to track everything, so instead of
                  managing chaos, you&apos;re just moving forward.
                </p>
              </div>
              {/* features */}
              <div className="flex flex-col gap-4 sm:gap-5">
                {features.map((f) => (
                  <div key={f.label} className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon size={16} stroke="#2563eb" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white">
                        {f.label}
                      </span>
                      <span className="text-[13px] sm:text-[14px] text-gray-400 dark:text-zinc-500 leading-snug">
                        {f.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-center items-center px-6 sm:px-10 lg:px-14 py-10 sm:py-12 lg:py-0 bg-gray-50 dark:bg-zinc-900/30 overflow-y-auto"
          >
            <div className="w-full max-w-90">
              <div className="mb-5 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                  {activeTab === "signin" ? "Sign in to" : "Sign up for"}{" "}
                  <span className="text-blue-600">JobPace</span>
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-500">
                  {activeTab === "signin"
                    ? "Track every application, never miss a follow-up."
                    : "Create your account and start tracking today."}
                </p>
              </div>

              {/* Tab Toggle */}
              <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 mb-4">
                {(["signin", "signup"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === tab ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300"}`}
                  >
                    {tab === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>



              {/* General Error */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {formError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form action={handleCredentialsSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{
                      opacity: 0,
                      x: activeTab === "signup" ? 20 : -20,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "signup" ? -20 : 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Name */}
                    {activeTab === "signup" && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5"
                          >
                            First Name
                          </label>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            autoComplete="given-name"
                            placeholder="Juan"
                            maxLength={50}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${fieldErrors.firstName ? "border-red-400 dark:border-red-600" : "border-gray-200 dark:border-zinc-700"}`}
                          />
                          <FieldError errors={fieldErrors.firstName} />
                        </div>
                        <div className="flex-1">
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5"
                          >
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            autoComplete="family-name"
                            placeholder="Dela Cruz"
                            maxLength={50}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${fieldErrors.lastName ? "border-red-400 dark:border-red-600" : "border-gray-200 dark:border-zinc-700"}`}
                          />
                          <FieldError errors={fieldErrors.lastName} />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
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
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${fieldErrors.email ? "border-red-400 dark:border-red-600" : "border-gray-200 dark:border-zinc-700"}`}
                      />
                      <FieldError errors={fieldErrors.email} />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5"
                      >
                        Password
                      </label>
                      <PasswordInput
                        id="password"
                        name="password"
                        required
                        maxLength={72}
                        autoComplete={
                          activeTab === "signup"
                            ? "new-password"
                            : "current-password"
                        }
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        hasError={!!fieldErrors.password}
                      />
                      {activeTab === "signup" && (
                        <PasswordRequirements validation={validation} />
                      )}
                      {activeTab === "signin" && (
                        <div className="mt-1.5 text-right">
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>
                            {activeTab === "signin"
                              ? "Signing in..."
                              : "Creating account..."}
                          </span>
                        </div>
                      ) : activeTab === "signin" ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full cursor-pointer flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:shadow-lg text-gray-800 dark:text-white text-sm font-bold transition-all disabled:opacity-50 mb-4"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  </>
                )}
              </button>

              <p className="text-[12px] text-gray-400 text-center leading-relaxed">
                By continuing you agree to our{" "}
                <button
                  onClick={() => setModalType("terms")}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  onClick={() => setModalType("privacy")}
                  className="text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Privacy
                </button>
                .
              </p>
            </div>
          </motion.div>
        </div>

        <VerificationModal
          isOpen={showVerificationNotice}
          onClose={() => setShowVerificationNotice(false)}
          email={unverifiedEmail}
          onResend={handleResendVerification}
          isResending={isResending}
          resendCooldown={resendCooldown}
        />

        <PolicyModal
          isOpen={modalType === "terms"}
          onClose={() => setModalType(null)}
          title="Terms of Service"
          content={
            <div className="space-y-4">
              <h3>1. Introduction</h3>
              <p>
                Welcome to JobPace. By using our service, you agree to these
                terms.
              </p>
              <h3>2. Your Account</h3>
              <p>
                Keep your password confidential. You are responsible for
                activity on your account.
              </p>
            </div>
          }
        />
        <PolicyModal
          isOpen={modalType === "privacy"}
          onClose={() => setModalType(null)}
          title="Privacy Policy"
          content={
            <div className="space-y-4">
              <h3>1. Information We Collect</h3>
              <p>
                Your name, email, and job application data to provide and
                improve our service.
              </p>
              <h3>2. Information Security</h3>
              <p>
                We protect your data from unauthorized access and disclosure.
              </p>
            </div>
          }
        />
      </div>
    </>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="mt-1.5">
      {errors.map((error, i) => (
        <p key={i} className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      ))}
    </div>
  );
}
