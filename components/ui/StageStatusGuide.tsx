"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STAGE_CONFIG, STATUS_CONFIG, STAGES, STATUSES } from "@/lib/constants";

export default function StageStatusGuide() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    },
    [open],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!mounted) {
    return (
      <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" />
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-all hover:scale-110"
        title="What are stages and statuses?"
        aria-label="Stages and statuses guide"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Stages & Statuses Guide
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto space-y-5">
                {/* Stages */}
                <div>
                  <div className="flex items-center gap-2 pl-3 border-l-2 border-blue-500 mb-3">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                      Stages
                    </h4>
                  </div>

                  <table className="w-full">
                    <tbody>
                      {STAGES.map((s) => {
                        const cfg = STAGE_CONFIG[s];
                        return (
                          <tr key={s} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <td className="py-2 pr-3">
                              <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="py-2 text-xs text-zinc-600 dark:text-zinc-300">
                              {cfg.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Statuses */}
                <div>
                  <div className="flex items-center gap-2 pl-3 border-l-2 border-amber-500 mb-3">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                      Statuses
                    </h4>
                  </div>

                  <table className="w-full">
                    <tbody>
                      {STATUSES.map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <tr key={s} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <td className="py-2 pr-3 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span className="text-xs font-semibold">{cfg.label}</span>
                            </td>
                            <td className="py-2 text-xs text-zinc-600 dark:text-zinc-300">
                              {cfg.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
