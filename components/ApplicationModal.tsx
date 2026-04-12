"use client";

import { useState, useEffect, useTransition } from "react";
import { createApplication, updateApplication } from "@/lib/actions";
import type { ApplicationRow } from "@/lib/actions";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "exam", label: "Exam" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
];

const SOURCE_OPTIONS = [
  "Jobstreet",
  "LinkedIn",
  "Kalibrr",
  "Indeed",
  "Referral",
  "Company Website",
  "Facebook",
  "Walk-in",
  "Other",
];

const WORK_SETUP_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contractual", label: "Contractual" },
  { value: "project-based", label: "Project-based" },
  { value: "ojt-internship", label: "OJT / Internship" },
];

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  editData?: ApplicationRow | null;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function ApplicationModal({ open, onClose, editData }: Props) {
  const isEdit = !!editData;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  // Prevent body scroll when modal is open
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

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateApplication(editData!.id, formData)
        : await createApplication(formData);

      if (result.success) {
        onClose();
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-[modalIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DFE1E6] bg-gradient-to-r from-[#0052CC]/5 to-transparent">
          <div>
            <h2 className="text-lg font-semibold text-[#172B4D]">
              {isEdit ? "Edit Application" : "Add New Application"}
            </h2>
            <p className="text-xs text-[#5E6C84] mt-0.5">
              {isEdit
                ? "Update the details of your application"
                : "Track a new job application"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5E6C84] hover:bg-[#F4F5F7] hover:text-[#172B4D] transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
                </svg>
                {error}
              </div>
            )}

            {/* ── Basic Info ── */}
            <fieldset>
              <legend className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">
                Basic Information
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    defaultValue={editData?.companyName ?? ""}
                    placeholder="e.g. Accenture Philippines"
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="position" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    required
                    defaultValue={editData?.position ?? ""}
                    placeholder="e.g. Junior Software Developer"
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={editData?.location ?? ""}
                    placeholder="e.g. Makati, BGC, Cebu"
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="workSetup" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Work Setup
                  </label>
                  <select
                    id="workSetup"
                    name="workSetup"
                    defaultValue={editData?.workSetup ?? ""}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
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
                  <label htmlFor="employmentType" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Employment Type
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    defaultValue={editData?.employmentType ?? ""}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
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

            {/* ── Salary ── */}
            <fieldset>
              <legend className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">
                Monthly Salary Range (₱)
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="salaryMin" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Minimum
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5E6C84]">₱</span>
                    <input
                      id="salaryMin"
                      name="salaryMin"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={editData?.salaryMin ?? ""}
                      placeholder="25,000"
                      className="w-full pl-7 pr-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="salaryMax" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Maximum
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5E6C84]">₱</span>
                    <input
                      id="salaryMax"
                      name="salaryMax"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={editData?.salaryMax ?? ""}
                      placeholder="35,000"
                      className="w-full pl-7 pr-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* ── Tracking ── */}
            <fieldset>
              <legend className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">
                Tracking
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue={editData?.status ?? "applied"}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    defaultValue={editData?.source ?? ""}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
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
                  <label htmlFor="applicationLink" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Application Link
                  </label>
                  <input
                    id="applicationLink"
                    name="applicationLink"
                    type="url"
                    defaultValue={editData?.applicationLink ?? ""}
                    placeholder="e.g. https://jobstreet.com.ph/job/12345"
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="dateApplied" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Date Applied <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dateApplied"
                    name="dateApplied"
                    type="date"
                    required
                    defaultValue={
                      editData
                        ? toDateInputValue(editData.dateApplied)
                        : toDateInputValue(new Date())
                    }
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="followUpDate" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Follow-up Date
                  </label>
                  <input
                    id="followUpDate"
                    name="followUpDate"
                    type="date"
                    defaultValue={toDateInputValue(editData?.followUpDate)}
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all"
                  />
                </div>
              </div>
            </fieldset>

            {/* ── Details ── */}
            <fieldset>
              <legend className="text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wide mb-3">
                Details
              </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Job Description
                  </label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    rows={3}
                    defaultValue={editData?.jobDescription ?? ""}
                    placeholder="Paste the job description or key requirements here..."
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all resize-y min-h-[80px]"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-[#172B4D] mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    defaultValue={editData?.notes ?? ""}
                    placeholder="Any personal notes, reminders, or interview details..."
                    className="w-full px-3 py-2 border border-[#DFE1E6] rounded-lg text-sm text-[#172B4D] placeholder:text-[#B3BAC5] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 focus:border-[#0052CC] transition-all resize-y min-h-[60px]"
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F4F5F7] border-t border-[#DFE1E6]">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-[#5E6C84] bg-white border border-[#DFE1E6] rounded-lg hover:bg-[#F4F5F7] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-[#0052CC] rounded-lg hover:bg-[#0747A6] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isPending && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {isEdit ? "Save Changes" : "Add Application"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
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
    </div>
  );
}
