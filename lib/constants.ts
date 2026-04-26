// ──────────────────────────────────────────────
// Application status configuration
// ──────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

/**
 * Canonical status map — every component should import from here.
 * `bg` and `text` include dark-mode variants.
 */
export const APPLICATION_STATUSES: Record<string, StatusConfig> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  interview: {
    label: "Interview",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  exam: {
    label: "Exam",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  offer: {
    label: "Offer",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  hired: {
    label: "Hired",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-600",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  ghosted: {
    label: "Ghosted",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
};

/** Ordered columns for the Kanban board. */
export const KANBAN_COLUMNS = [
  "applied",
  "interview",
  "exam",
  "offer",
  "hired",
  "rejected",
  "ghosted",
] as const;

// ──────────────────────────────────────────────
// Kanban-specific extras (header background)
// ──────────────────────────────────────────────

export const KANBAN_HEADER_BG: Record<string, string> = {
  applied: "bg-blue-100 dark:bg-blue-900/30",
  interview: "bg-indigo-100 dark:bg-indigo-900/30",
  exam: "bg-purple-100 dark:bg-purple-900/30",
  offer: "bg-emerald-100 dark:bg-emerald-900/30",
  hired: "bg-green-100 dark:bg-green-900/30",
  rejected: "bg-red-100 dark:bg-red-900/30",
  ghosted: "bg-zinc-200 dark:bg-zinc-800",
};

// ──────────────────────────────────────────────
// Activity log action types
// ──────────────────────────────────────────────

export interface ActionTypeConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
}

export const ACTION_TYPES: Record<string, ActionTypeConfig> = {
  CREATE: {
    label: "Created",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
  },
  UPDATE: {
    label: "Updated",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
  },
  STATUS_CHANGE: {
    label: "Status Changed",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  DELETE: {
    label: "Deleted",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
};

// ──────────────────────────────────────────────
// Form dropdown options
// ──────────────────────────────────────────────

export const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "exam", label: "Exam" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
] as const;

export const SOURCE_OPTIONS = [
  "Jobstreet",
  "LinkedIn",
  "Kalibrr",
  "Indeed",
  "Referral",
  "Company Website",
  "Facebook",
  "Walk-in",
  "Other",
] as const;

export const WORK_SETUP_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contractual", label: "Contractual" },
  { value: "project-based", label: "Project-based" },
  { value: "ojt-internship", label: "OJT / Internship" },
] as const;
