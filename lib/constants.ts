// ──────────────────────────────────────────────
// Stage configuration (where you are in the process)
// ──────────────────────────────────────────────

export const STAGES = [
  "applied",
  "screening",
  "interview",
  "assessment",
  "final_interview",
  "offer",
  "hired",
  "rejected",
  "ghosted",
  "withdrawn",
] as const;

export type Stage = (typeof STAGES)[number];

export const FINAL_STAGES = [
  "hired",
  "rejected",
  "ghosted",
  "withdrawn",
] as const;

export interface StageConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  description: string;
}

/**
 * Canonical stage map — every component should import from here.
 * `bg` and `text` include dark-mode variants.
 */
export const STAGE_CONFIG: Record<Stage, StageConfig> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    description: "You submitted your application",
  },
  screening: {
    label: "Screening",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
    dot: "bg-cyan-500",
    description: "HR is reviewing your resume/profile",
  },
  interview: {
    label: "Interview",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
    dot: "bg-indigo-500",
    description: "Initial interview with HR or hiring manager",
  },
  assessment: {
    label: "Assessment",
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
    description: "Technical exam, coding test, or skills assessment",
  },
  final_interview: {
    label: "Final Interview",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-500",
    description: "Final round interview with leadership/panel",
  },
  offer: {
    label: "Offer",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    description: "You received a job offer",
  },
  hired: {
    label: "Hired",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-600",
    description: "You accepted and are officially hired!",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
    description: "Application was formally rejected",
  },
  ghosted: {
    label: "Ghosted",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-500 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-700",
    dot: "bg-zinc-400",
    description: "No response after a reasonable wait",
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    description: "You chose to withdraw your application",
  },
};

// ──────────────────────────────────────────────
// Status configuration (what's happening in that stage)
// ──────────────────────────────────────────────

export const STATUSES = [
  "pending",
  "ongoing",
  "passed",
  "failed",
] as const;

export type Status = (typeof STATUSES)[number];

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
  description: string;
}

export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    description: "Waiting for a response or next step",
  },
  ongoing: {
    label: "Ongoing",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    description: "Currently in progress at this stage",
  },
  passed: {
    label: "Passed",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
    description: "Successfully cleared this stage",
  },
  failed: {
    label: "Failed",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    description: "Did not pass this stage",
  },
};

// ──────────────────────────────────────────────
// Kanban board configuration
// ──────────────────────────────────────────────

/** Ordered columns for the Kanban board (by stage). We omit the negative final stages from the board. */
export const KANBAN_COLUMNS = STAGES.filter((s) => !["rejected", "ghosted", "withdrawn"].includes(s));

export const KANBAN_HEADER_BG: Record<Stage, string> = {
  applied: "bg-blue-100 dark:bg-blue-900/30",
  screening: "bg-cyan-100 dark:bg-cyan-900/30",
  interview: "bg-indigo-100 dark:bg-indigo-900/30",
  assessment: "bg-purple-100 dark:bg-purple-900/30",
  final_interview: "bg-violet-100 dark:bg-violet-900/30",
  offer: "bg-emerald-100 dark:bg-emerald-900/30",
  hired: "bg-green-100 dark:bg-green-900/30",
  rejected: "bg-rose-100 dark:bg-rose-900/30",
  ghosted: "bg-zinc-100 dark:bg-zinc-800",
  withdrawn: "bg-slate-100 dark:bg-slate-800",
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
    label: "Stage Changed",
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

export const STAGE_OPTIONS = STAGES.map((s) => ({
  value: s,
  label: STAGE_CONFIG[s].label,
}));

export const STATUS_OPTIONS = STATUSES.map((s) => ({
  value: s,
  label: STATUS_CONFIG[s].label,
}));

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
