"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMail } from "react-icons/fi";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResend: () => void;
  isResending: boolean;
  resendCooldown: number;
}

export default function VerificationModal({
  isOpen,
  onClose,
  email,
  onResend,
  isResending,
  resendCooldown,
}: VerificationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl pointer-events-auto border border-zinc-200 dark:border-zinc-800 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg text-slate-800 dark:text-slate-200 font-bold">Verify Your Email</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  We've sent a verification link to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>. Please check your inbox and click the link to verify your account before signing in.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4">
                  <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
                    Didn't receive the email? Check your spam folder or request a new link.
                  </p>
                  <button
                    onClick={onResend}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend available in ${resendCooldown}s`
                    ) : (
                      "Resend verification email"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
