"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createApplication, updateApplication } from "@/lib/actions";
import type { ApplicationRow, UserDocumentRow } from "@/lib/queries";
import {
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  WORK_SETUP_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FINAL_STAGES,
} from "@/lib/constants";
import { toDateInputValue, getDateValidationBounds } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Brain } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: ApplicationRow | null;
  readOnly?: boolean;
  documents?: UserDocumentRow[];
}

export default function ApplicationModal({
  open,
  onClose,
  editData,
  readOnly = false,
  documents = [],
}: Props) {
  const isEdit = !!editData;
  const isViewOnly = readOnly;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>(
    editData?.stage ?? "applied",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    editData?.status ?? "pending",
  );
  const [showAdvanced, setShowAdvanced] = useState(isEdit || isViewOnly);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractText, setExtractText] = useState("");
  const [isPrepMode, setIsPrepMode] = useState(false);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>(
    editData?.linkedResumeUrl ?? "",
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    skills: string[];
    insights: string;
  } | null>(null);

  const isFinalStage = FINAL_STAGES.includes(selectedStage as any);
  const dateBounds = getDateValidationBounds();

  useEffect(() => {
    if (open) {
      setError(null);
      setAiAnalysis(null);
      setSelectedStage(editData?.stage ?? "applied");
      setSelectedStatus(editData?.status ?? "pending");
      setShowAdvanced(isEdit || isViewOnly);
      setIsPrepMode(false);
      setSelectedResumeUrl(editData?.linkedResumeUrl ?? "");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, editData]);

  const handleExtract = async () => {
    if (!extractText.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractText }),
      });
      if (!res.ok) {
        throw new Error("Extraction failed");
      }
      const data = await res.json();

      if (data.companyName) {
        const el = document.getElementById("companyName") as HTMLInputElement;
        if (el) el.value = data.companyName;
      }
      if (data.position) {
        const el = document.getElementById("position") as HTMLInputElement;
        if (el) el.value = data.position;
      }
      if (data.location) {
        const el = document.getElementById("location") as HTMLInputElement;
        if (el) el.value = data.location;
      }
      if (data.workSetup) {
        const el = document.getElementById("workSetup") as HTMLSelectElement;
        if (el) el.value = data.workSetup;
      }
      if (data.employmentType) {
        const el = document.getElementById(
          "employmentType",
        ) as HTMLSelectElement;
        if (el) el.value = data.employmentType;
      }

      toast.success("Form auto-filled successfully!");
      setExtractText("");
    } catch (err) {
      toast.error("Failed to extract details. Please try manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateApplication(editData!.id, formData)
        : await createApplication(formData);

      if (result.success) {
        if (isEdit) {
          if (result.changes && result.changes.length > 0) {
            toast.success("Application updated", {
              description: result.changes.join("\n"),
            });
          } else {
            toast.success("Application updated");
          }
        } else {
          toast.success("Application added", {
            description: `${formData.get("companyName")} - ${formData.get("position")}`,
          });
        }

        if (selectedStage === "hired" && editData?.stage !== "hired") {
          const duration = 15 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
          };
          const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

          const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
          }, 250);
        }
        onClose();
      } else {
        toast.error(result.error ?? "Something went wrong.");
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50/50 dark:from-blue-900/10 to-transparent">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {isPrepMode
                    ? "Interview Prep"
                    : isViewOnly
                      ? "View Application"
                      : isEdit
                        ? "Edit Application"
                        : "Add New Application"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {isPrepMode
                    ? `${editData?.companyName} · ${editData?.position}`
                    : isViewOnly
                      ? "Historical record of this application"
                      : isEdit
                        ? "Update the details of your application"
                        : "Track a new job application"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Interview Prep Mode button — only for interview/final_interview stage edits */}
                {isEdit &&
                  !isViewOnly &&
                  (selectedStage === "interview" ||
                    selectedStage === "final_interview") && (
                    <button
                      type="button"
                      onClick={() => setIsPrepMode((v) => !v)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                        isPrepMode
                          ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                          : "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      }`}
                    >
                      {isPrepMode ? "Exit Prep Mode" : "Interview Prep"}
                    </button>
                  )}
                <button
                  type="button"
                  onClick={onClose}
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
            </div>

            {/* Form */}
            <form
              action={handleSubmit}
              className="flex-1 overflow-y-auto flex flex-col min-h-0"
            >
              {/* Hidden input to persist selected resume URL */}
              <input
                type="hidden"
                name="linkedResumeUrl"
                value={selectedResumeUrl}
              />
              {/* PREP MODE view */}
              {isPrepMode && editData ? (
                <div className="flex-1 px-6 py-6 space-y-7 overflow-y-auto">
                  {/* Interview date badge */}
                  {editData.interviewDate && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                      >
                        <rect x="2" y="3" width="12" height="10" rx="1.5" />
                        <path d="M2 6h12M5 1v2M11 1v2" />
                      </svg>
                      <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                        Interview:{" "}
                        {new Date(editData.interviewDate).toLocaleDateString(
                          "en-PH",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {/* Linked Resume */}
                  {editData.linkedResumeUrl && (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                        My Resume
                      </h3>
                      <a
                        href={editData.linkedResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="w-4 h-4"
                        >
                          <path d="M4 2h5.5L12 4.5V13a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
                          <path d="M8 2v3h3" />
                        </svg>
                        View Resume I Submitted
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="w-3 h-3"
                        >
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {/* Company Research */}
                  {editData.companyResearch ? (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                        Company Research
                      </h3>
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {editData.companyResearch}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                        Company Research
                      </h3>
                      <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
                        No company research added yet. Exit Prep Mode to add
                        some.
                      </p>
                    </div>
                  )}

                  {/* Job Description */}
                  {editData.jobDescription ? (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                        Job Description
                      </h3>
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {editData.jobDescription}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Notes */}
                  {editData.notes ? (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                        My Notes
                      </h3>
                      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {editData.notes}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="px-6 py-5 space-y-6 flex-1">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-4 h-4 mt-0.5 shrink-0"
                      >
                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Magic Auto-fill (Only for new applications) */}
                  {!isEdit && !isViewOnly && (
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 p-5 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        {/* <Brain className="w-4 h-4 text-zinc-900 dark:text-zinc-100" /> */}
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          JobPace AI Auto-fill
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Paste a Job Description or LinkedIn snippet below. Let
                        JobPace AI parse the details and automatically fill out
                        this form for you!
                      </p>
                      <textarea
                        value={extractText}
                        maxLength={2000}
                        onChange={(e) => setExtractText(e.target.value)}
                        placeholder="Paste job description here..."
                        className="w-full transition-all duration-300 ease-in-out px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-900 dark:focus:border-zinc-100 transition-all resize-y min-h-[80px]"
                        disabled={isExtracting}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleExtract}
                          disabled={isExtracting || !extractText.trim()}
                          className="px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {isExtracting && (
                            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          )}
                          {isExtracting ? "Extracting Details..." : "Auto-fill"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Basic Info */}
                  <fieldset>
                    <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                      Basic Information
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="companyName"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Company Name{" "}
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          required
                          disabled={isViewOnly}
                          defaultValue={editData?.companyName ?? ""}
                          placeholder="e.g. Accenture Philippines"
                          maxLength={100}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="position"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Position{" "}
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                        </label>
                        <input
                          id="position"
                          name="position"
                          type="text"
                          required
                          disabled={isViewOnly}
                          defaultValue={editData?.position ?? ""}
                          placeholder="e.g. Junior Software Developer"
                          maxLength={100}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Location
                        </label>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          disabled={isViewOnly}
                          defaultValue={editData?.location ?? ""}
                          placeholder="e.g. Makati, BGC, Cebu"
                          maxLength={100}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="workSetup"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Work Setup
                        </label>
                        <select
                          id="workSetup"
                          name="workSetup"
                          disabled={isViewOnly}
                          defaultValue={editData?.workSetup ?? ""}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                        >
                          <option value="">Select...</option>
                          {WORK_SETUP_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="employmentType"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Employment Type
                        </label>
                        <select
                          id="employmentType"
                          name="employmentType"
                          disabled={isViewOnly}
                          defaultValue={editData?.employmentType ?? ""}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                        >
                          <option value="">Select...</option>
                          {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  {/* Tracking */}
                  <fieldset>
                    <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                      Tracking
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="stage"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Stage{" "}
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                        </label>
                        <select
                          id="stage"
                          name="stage"
                          required
                          value={selectedStage}
                          disabled={isViewOnly}
                          onChange={(e) => {
                            const newStage = e.target.value;
                            setSelectedStage(newStage);
                            if (newStage !== (editData?.stage ?? "applied")) {
                              setSelectedStatus("pending");
                            } else {
                              setSelectedStatus(editData?.status ?? "pending");
                            }
                          }}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                        >
                          {STAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="status"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Status{" "}
                          {isFinalStage ? (
                            ""
                          ) : (
                            <span className="text-red-500 dark:text-red-400">
                              *
                            </span>
                          )}
                        </label>
                        <select
                          id="status"
                          name="status"
                          required={!isFinalStage}
                          disabled={isFinalStage || isViewOnly}
                          value={isFinalStage ? "" : selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900/50"
                        >
                          {isFinalStage && (
                            <option value="">Not applicable</option>
                          )}
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="source"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Source
                        </label>
                        <select
                          id="source"
                          name="source"
                          disabled={isViewOnly}
                          defaultValue={editData?.source ?? ""}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                        >
                          <option value="">Select...</option>
                          {SOURCE_OPTIONS.map((src) => (
                            <option key={src} value={src}>
                              {src}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="applicationLink"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Application Link
                        </label>
                        <input
                          id="applicationLink"
                          name="applicationLink"
                          type="url"
                          disabled={isViewOnly}
                          defaultValue={editData?.applicationLink ?? ""}
                          placeholder="e.g. https://jobstreet.com.ph/job/12345"
                          maxLength={1000}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="dateApplied"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Date Applied{" "}
                          <span className="text-red-500 dark:text-red-400">
                            *
                          </span>
                        </label>
                        <input
                          id="dateApplied"
                          name="dateApplied"
                          type="date"
                          required
                          min={dateBounds.min}
                          max={dateBounds.max}
                          disabled={isViewOnly}
                          defaultValue={
                            editData
                              ? toDateInputValue(editData.dateApplied)
                              : toDateInputValue(new Date())
                          }
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="followUpDate"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Follow-up Date
                        </label>
                        <input
                          id="followUpDate"
                          name="followUpDate"
                          type="date"
                          min={dateBounds.min}
                          max={dateBounds.max}
                          disabled={isViewOnly}
                          defaultValue={toDateInputValue(
                            editData?.followUpDate,
                          )}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="interviewDate"
                          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                        >
                          Interview Date
                        </label>
                        <input
                          id="interviewDate"
                          name="interviewDate"
                          type="date"
                          min={dateBounds.min}
                          max={dateBounds.max}
                          disabled={isViewOnly}
                          defaultValue={toDateInputValue(
                            editData?.interviewDate,
                          )}
                          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {!showAdvanced && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                      className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      + Add More Details (Salary, Contacts, Notes)
                    </button>
                  )}

                  {showAdvanced && (
                    <div className="space-y-6">
                      {/* Advanced Details Header */}
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                          Advanced Details
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(false)}
                          className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3 h-3"
                          >
                            <path d="M4 10l4-4 4 4" />
                          </svg>
                          Hide Details
                        </button>
                      </div>

                      {/* Salary */}
                      <fieldset>
                        <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                          Monthly Salary Range (₱)
                        </legend>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="salaryMin"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Minimum
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400">
                                ₱
                              </span>
                              <input
                                id="salaryMin"
                                name="salaryMin"
                                type="number"
                                min="0"
                                step="1000"
                                disabled={isViewOnly}
                                defaultValue={editData?.salaryMin ?? ""}
                                placeholder="25,000"
                                className="w-full pl-7 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="salaryMax"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Maximum
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400">
                                ₱
                              </span>
                              <input
                                id="salaryMax"
                                name="salaryMax"
                                type="number"
                                min="0"
                                step="1000"
                                disabled={isViewOnly}
                                defaultValue={editData?.salaryMax ?? ""}
                                placeholder="35,000"
                                className="w-full pl-7 pr-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>

                      {/* Linked Resume */}
                      <fieldset>
                        <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                          Linked Resume
                        </legend>
                        {documents.length > 0 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedResumeUrl}
                                onChange={(e) =>
                                  setSelectedResumeUrl(e.target.value)
                                }
                                disabled={isViewOnly}
                                className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-70 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                              >
                                <option value="">No resume linked</option>
                                {documents.map((doc) => (
                                  <option key={doc.id} value={doc.url}>
                                    {doc.name}
                                  </option>
                                ))}
                              </select>
                              {selectedResumeUrl && (
                                <a
                                  href={selectedResumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View resume"
                                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                >
                                  <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="w-4 h-4"
                                  >
                                    <path d="M3 8h10M9 4l4 4-4 4" />
                                  </svg>
                                </a>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-600">
                              Link the exact resume version you submitted. Visible in Interview Prep mode.
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            No documents found. Go to{" "}
                            <a
                              href="/dashboard/resume-and-documents"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              Resume & Documents
                            </a>{" "}
                            to upload your resume first.
                          </p>
                        )}
                      </fieldset>

                      {/* Contact Info */}
                      <fieldset>
                        <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                          Recruiter Contact
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="contactName"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Contact Name
                            </label>
                            <input
                              id="contactName"
                              name="contactName"
                              type="text"
                              disabled={isViewOnly}
                              defaultValue={editData?.contactName ?? ""}
                              placeholder="e.g. Juan Dela Cruz"
                              maxLength={100}
                              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="contactEmail"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Contact Email
                            </label>
                            <input
                              id="contactEmail"
                              name="contactEmail"
                              type="email"
                              disabled={isViewOnly}
                              defaultValue={editData?.contactEmail ?? ""}
                              placeholder="e.g. recruiter@company.com"
                              maxLength={255}
                              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all disabled:opacity-70"
                            />
                          </div>
                        </div>
                      </fieldset>

                      {/* Details */}
                      <fieldset>
                        <legend className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                          Details & Research
                        </legend>
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="companyResearch"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Company Research
                            </label>
                            <textarea
                              id="companyResearch"
                              name="companyResearch"
                              rows={3}
                              disabled={isViewOnly}
                              defaultValue={editData?.companyResearch ?? ""}
                              placeholder="What do you know about this company? Culture, tech stack, news..."
                              maxLength={10000}
                              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all resize-none min-h-[80px] disabled:opacity-70"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label
                                htmlFor="jobDescription"
                                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                              >
                                Job Description
                              </label>
                            </div>
                            <textarea
                              id="jobDescription"
                              name="jobDescription"
                              rows={3}
                              disabled={isViewOnly}
                              defaultValue={editData?.jobDescription ?? ""}
                              maxLength={10000}
                              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all resize-none min-h-[80px] disabled:opacity-70"
                            />

                            <AnimatePresence>
                              {aiAnalysis && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                                      <Brain className="w-3 h-3" />
                                      AI Insights
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {aiAnalysis.skills.map((s) => (
                                        <span
                                          key={s}
                                          className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-800 text-[10px] font-medium text-purple-700 dark:text-purple-300"
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed italic">
                                      &quot;{aiAnalysis.insights}&quot;
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label
                              htmlFor="notes"
                              className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1"
                            >
                              Notes
                            </label>
                            <textarea
                              id="notes"
                              name="notes"
                              rows={2}
                              disabled={isViewOnly}
                              defaultValue={editData?.notes ?? ""}
                              maxLength={10000}
                              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 transition-all resize-none min-h-[60px] disabled:opacity-70"
                            />
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  )}
                </div>
              )}{" "}
              {/* end: isPrepMode ternary else branch */}
              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {isViewOnly ? "Close" : "Cancel"}
                </button>
                {!isViewOnly && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {isPending && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isEdit ? "Save Changes" : "Add Application"}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
