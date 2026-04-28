"use client";

import { useState, useEffect, useCallback } from "react";
import { STAGE_CONFIG, STATUS_CONFIG, STAGES, STATUSES } from "@/lib/constants";

export default function StageStatusGuide() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
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
      <button
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
        aria-label="Stages and statuses guide"
      >
        ?
      </button>
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-[modalIn_0.2s_ease-out]"
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
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-3.5 h-3.5 text-blue-500"
                    >
                      <path d="M2 8h12M9 4l4 4-4 4" />
                    </svg>
                    Stages
                  </h4>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    — where you are in the process
                  </span>
                </div>

                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-36" />
                    <col />
                  </colgroup>
                  <tbody>
                    {STAGES.map((s) => {
                      const cfg = STAGE_CONFIG[s];
                      return (
                        <tr
                          key={s}
                          className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                        >
                          <td className="py-2.5 pr-3 align-middle">
                            <span
                              className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider w-full ${cfg.bg} ${cfg.text} ${cfg.border}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-2.5 align-middle">
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">
                              {cfg.description}
                            </span>
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
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-3.5 h-3.5 text-amber-500"
                    >
                      <circle cx="8" cy="8" r="6" />
                      <path d="M8 5v3l2 2" />
                    </svg>
                    Statuses
                  </h4>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{`— what's happening in that stage`}</span>
                </div>

                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-36" />
                    <col />
                  </colgroup>
                  <tbody>
                    {STATUSES.map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <tr
                          key={s}
                          className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                        >
                          <td className="py-2.5 pr-3 align-middle">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                              />
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                {cfg.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 align-middle">
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">
                              {cfg.description}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Example */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-800/30">
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  <strong>Example:</strong> Stage ={" "}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    INTERVIEW
                  </span>
                  , Status ={" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Pending
                  </span>{" "}
                  means you&apos;re waiting for your interview schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
