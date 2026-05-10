"use client";

import { CheckCircle2, XCircle } from "lucide-react";

type ActionCardProps = {
  action: {
    tool: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
    success: boolean;
  };
};

const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  assessment: "Assessment",
  final_interview: "Final Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  ongoing: "Ongoing",
  passed: "Passed",
  failed: "Failed",
};

function getActionMessage(action: ActionCardProps["action"]): string {
  const { tool, args, result, success } = action;

  if (!success) {
    const error =
      (result as { error?: string }).error || "An unknown error occurred";
    return `Action failed — ${error}`;
  }

  const data = result.data as Record<string, unknown> | undefined;

  switch (tool) {
    case "update_stage": {
      const company = data?.companyName || args.companyName;
      const stage = STAGE_LABELS[(args.stage as string) || ""] || args.stage;
      return `Stage updated — ${company} moved to ${stage}`;
    }
    case "update_status": {
      const company = data?.companyName || args.companyName;
      const status =
        STATUS_LABELS[(args.status as string) || ""] || args.status;
      return `Status updated — ${company} marked as ${status}`;
    }
    case "add_application": {
      const company = data?.companyName || args.companyName;
      const position = data?.position || args.position;
      return `Added — ${company} (${position}) is now tracked`;
    }
    case "delete_application": {
      const company = data?.companyName || args.companyName;
      return `Deleted — ${company} application removed`;
    }
    case "get_applications": {
      const apps = data as unknown as unknown[] | undefined;
      return `Fetched ${Array.isArray(apps) ? apps.length : 0} applications`;
    }
    default:
      return `Action completed: ${tool}`;
  }
}

export default function ActionCard({ action }: ActionCardProps) {
  const message = getActionMessage(action);

  return (
    <div
      className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
        action.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
      }`}
    >
      {action.success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
