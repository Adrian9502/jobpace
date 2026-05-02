import { STAGES, STAGE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { Status } from "@/lib/constants";

export const STAGE_FILTERS = [
  "All",
  ...STAGES.map((s) => STAGE_CONFIG[s].label),
];

export const STATUS_NOTE_STYLE: Record<string, string> = {
  hired: "text-emerald-600 dark:text-emerald-400",
  rejected: "text-rose-500 dark:text-rose-400",
  ghosted: "text-zinc-400 dark:text-zinc-500 italic",
  withdrawn: "text-zinc-400 dark:text-zinc-500 italic",
};

export function getStatusNote(
  stage: string,
  status: string | null,
  followUp: Date | null,
): string {
  if (!status) {
    if (stage === "hired") return "🎉 Congratulations! You got the job.";
    if (stage === "rejected") return "Application rejected.";
    if (stage === "ghosted") return "No response received.";
    if (stage === "withdrawn") return "You withdrew this application.";
    return "Tracking active";
  }
  if (status === "pending" && stage === "applied") {
    return followUp
      ? `Follow up on ${new Date(followUp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : "Waiting for initial response";
  }
  const statusCfg = STATUS_CONFIG[status as Status];
  if (statusCfg) return statusCfg.description;
  return "Tracking active";
}
