"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import PolicyModal from "../PolicyModal";

export default function LandingContent() {
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const closeModal = () => setModalType(null);

  const features = [
    {
      label: "Kanban board",
      desc: "Drag and drop across Applied, Screening, Interview, Offer",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ),
    },
    {
      label: "Application tracker",
      desc: "Stage, status, source, and timeline in one table",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
        </svg>
      ),
    },
    {
      label: "Analytics & insights",
      desc: "See your response rates, offer trends, and activity logs",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  const perks = [
    "Visualize your entire search history in a chronological stream.",
    "Stay accountable with a detailed record of every update and interaction.",
    "Safely store past opportunities and interview notes for future reference.",
    "No credit card, no trials—just a better way to find work.",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] selection:bg-blue-100 dark:selection:bg-blue-900/30 flex items-center justify-center px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl min-h-160 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {/* ── Left: Brand & Story ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center px-10 sm:px-14 py-16 lg:py-0 bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-zinc-800"
        >
          <div className="max-w-110 mx-auto lg:mx-0">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-14">
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

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-8">
              Your job search, <br />
              <span className="text-blue-600"> at your pace.</span>
            </h1>

            {/* Copy */}
            <div className="flex flex-col gap-5 text-[15px] text-gray-500 dark:text-zinc-400 leading-relaxed mb-12">
              <p>
                Applications get lost, follow-ups are forgotten, and the whole
                process starts to feel like shouting into the void.
              </p>
              <p>
                JobPace gives you one place to track everything, so instead of
                managing chaos, you&apos;re just moving forward.
              </p>
            </div>

            {/* Feature list */}
            <div className="flex flex-col gap-6">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-bold text-gray-900 dark:text-white">
                      {f.label}
                    </span>
                    <span className="text-[14px] text-gray-400 dark:text-zinc-500 leading-snug">
                      {f.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Right: Login ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col justify-center items-center px-10 sm:px-14 py-16 lg:py-0 bg-gray-50 dark:bg-zinc-900/30"
        >
          <div className="w-full max-w-90">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                Sign in to JobPace
              </h2>
              <p className="text-[15px] text-gray-500 dark:text-zinc-500">
                Track every application, never miss a follow-up.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:shadow-lg text-gray-800 dark:text-white text-[15px] font-bold transition-all mb-8 disabled:opacity-50"
            >
              {isLoading ? (
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

            <div className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-2xl p-6 mb-8">
              <p className="text-[12px] text-center font-bold text-gray-400 uppercase tracking-widest mb-4">
                Unlock your workspace
              </p>
              <div className="flex flex-col gap-4">
                {perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 bg-blue-50 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        className="w-3 h-3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600 dark:text-zinc-300 font-medium">
                      {perk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[13px] text-gray-400 text-center leading-relaxed">
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
      {/* closes grid */}

      {/* Modals */}
      <PolicyModal
        isOpen={modalType === "terms"}
        onClose={closeModal}
        title="Terms of Service"
        content={
          <div className="space-y-4">
            <h3>1. Introduction</h3>
            <p>
              Welcome to JobPace. By using our service, you agree to these
              terms. Please read them carefully.
            </p>
            <h3>2. Using our Services</h3>
            <p>
              You must follow any policies made available to you within the
              Services. Don&apos;t misuse our Services. For example, don&apos;t
              interfere with our Services or try to access them using a method
              other than the interface and the instructions that we provide.
            </p>
            <h3>3. Your JobPace Account</h3>
            <p>
              You need a Google Account to use JobPace. To protect your account,
              keep your password confidential. You are responsible for the
              activity that happens on or through your account.
            </p>
            <h3>4. Privacy and Copyright Protection</h3>
            <p>
              JobPace&apos;s privacy policies explain how we treat your personal
              data and protect your privacy when you use our Services. By using
              our Services, you agree that JobPace can use such data in
              accordance with our privacy policies.
            </p>
          </div>
        }
      />
      <PolicyModal
        isOpen={modalType === "privacy"}
        onClose={closeModal}
        title="Privacy Policy"
        content={
          <div className="space-y-4">
            <h3>1. Information We Collect</h3>
            <p>
              We collect information to provide better services to all our
              users. We collect information in the following ways:
            </p>
            <ul>
              <li>
                <strong>Information you give us:</strong> We use your Google
                account information (name, email, profile picture) to
                personalize your experience.
              </li>
              <li>
                <strong>
                  Information we get from your use of our services:
                </strong>{" "}
                We collect information about the job applications you track
                (company names, positions, statuses).
              </li>
            </ul>
            <h3>2. How We Use Information</h3>
            <p>
              We use the information we collect from all of our services to
              provide, maintain, protect and improve them, to develop new ones,
              and to protect JobPace and our users.
            </p>
            <h3>3. Information Security</h3>
            <p>
              We work hard to protect JobPace and our users from unauthorized
              access to or unauthorized alteration, disclosure or destruction of
              information we hold.
            </p>
          </div>
        }
      />
    </div>
  );
}
