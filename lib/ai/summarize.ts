import type { ApplicationRow } from "@/lib/queries";

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

/**
 * Build a lean context summary to inject into the AI system prompt.
 * Never includes jobDescription, companyResearch, or notes — those are expensive tokens.
 */
export function buildSummary(applications: ApplicationRow[]): string {
  if (applications.length === 0) {
    return "The user has no job applications yet.";
  }

  const lines: string[] = [];

  // Total count
  lines.push(`Total applications: ${applications.length}`);

  // Breakdown by stage
  const stageCounts: Record<string, number> = {};
  for (const app of applications) {
    stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
  }

  const stageBreakdown = Object.entries(stageCounts)
    .map(([stage, count]) => `${STAGE_LABELS[stage] || stage}(${count})`)
    .join(", ");
  lines.push(`By stage: ${stageBreakdown}`);

  // Last 5 applied (sorted by dateApplied desc)
  const sorted = [...applications].sort(
    (a, b) =>
      new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
  );
  const last5 = sorted.slice(0, 5);
  lines.push("");
  lines.push("Recent applications:");
  for (const app of last5) {
    const dateStr = new Date(app.dateApplied).toLocaleDateString("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    lines.push(
      `- ${app.companyName} — ${app.position} — ${STAGE_LABELS[app.stage] || app.stage} — Applied ${dateStr}`
    );
  }

  // Upcoming interviews (next 7 days, Asia/Manila)
  const now = new Date();
  const nowManila = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  const weekFromNow = new Date(nowManila.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingInterviews = applications.filter((app) => {
    if (!app.interviewDate) return false;
    const interviewManila = new Date(
      new Date(app.interviewDate).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      })
    );
    return interviewManila >= nowManila && interviewManila <= weekFromNow;
  });

  if (upcomingInterviews.length > 0) {
    lines.push("");
    lines.push("Upcoming interviews (next 7 days):");
    for (const app of upcomingInterviews) {
      const dateStr = new Date(app.interviewDate!).toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      lines.push(`- ${app.companyName} — ${app.position} — ${dateStr}`);
    }
  }

  // Follow-ups due today or overdue
  const todayManila = new Date(nowManila);
  todayManila.setHours(23, 59, 59, 999);

  const overdueFollowUps = applications.filter((app) => {
    if (!app.followUpDate) return false;
    const followUpManila = new Date(
      new Date(app.followUpDate).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      })
    );
    return followUpManila <= todayManila;
  });

  if (overdueFollowUps.length > 0) {
    lines.push("");
    lines.push("Follow-ups due or overdue:");
    for (const app of overdueFollowUps) {
      const dateStr = new Date(app.followUpDate!).toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
      });
      lines.push(
        `- ${app.companyName} — ${app.position} — Due ${dateStr}`
      );
    }
  }

  return lines.join("\n");
}
