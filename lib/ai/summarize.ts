import type { ApplicationRow, PersonalNoteRow, ActivityLogRow } from "@/lib/queries";
import type { UserDocumentRow, NotificationLogRow } from "@/lib/queries/ai";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ContextData = {
  applications: ApplicationRow[];
  notes: PersonalNoteRow[];
  activityLogs: ActivityLogRow[];
  documents: UserDocumentRow[];
  notificationLogs: NotificationLogRow[];
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const TERMINAL_STAGES = ["hired", "rejected", "ghosted", "withdrawn"];
const INTERVIEW_STAGES = [
  "interview",
  "assessment",
  "final_interview",
  "offer",
  "hired",
];

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

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function manilaDate(d: Date | string | null): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function manilaDateTime(d: Date | string | null): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNowManila(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor(
    (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(d: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d, yesterday);
}

// ──────────────────────────────────────────────
// Main Builder
// ──────────────────────────────────────────────

/**
 * Build a full context string (~800 tokens) covering all dashboard sections.
 * Uses counts and summaries only — never dumps raw arrays.
 */
export function buildFullContext(data: ContextData): string {
  const { applications, notes, activityLogs, documents, notificationLogs } =
    data;
  const lines: string[] = [];
  const now = getNowManila();

  // ═══════════════════════════════════════════
  // APPLICATIONS + ANALYTICS
  // ═══════════════════════════════════════════
  if (applications.length === 0) {
    lines.push("APPLICATIONS: None yet.");
  } else {
    const total = applications.length;
    lines.push(`APPLICATIONS: ${total} total`);

    // Stage breakdown
    const stageCounts: Record<string, number> = {};
    for (const app of applications) {
      stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
    }
    const stageStr = Object.entries(stageCounts)
      .filter(([, c]) => c > 0)
      .map(([s, c]) => `${STAGE_LABELS[s] || s}(${c})`)
      .join(", ");
    lines.push(`Stages: ${stageStr}`);

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const app of applications) {
      const status = app.status || "none";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
    const statusStr = Object.entries(statusCounts)
      .map(([s, c]) => `${s}(${c})`)
      .join(", ");
    lines.push(`Status: ${statusStr}`);

    // Rates
    const notAppliedOrWithdrawn = applications.filter(
      (a) => a.stage !== "applied" && a.stage !== "withdrawn"
    ).length;
    const interviewConv = applications.filter((a) =>
      INTERVIEW_STAGES.includes(a.stage)
    ).length;
    const offerCount = applications.filter(
      (a) => a.stage === "offer" || a.stage === "hired"
    ).length;
    const ghostedCount = stageCounts["ghosted"] || 0;
    const hiredCount = stageCounts["hired"] || 0;
    const rejectedCount = stageCounts["rejected"] || 0;
    const withdrawnCount = stageCounts["withdrawn"] || 0;

    lines.push(
      `Response rate: ${pct(notAppliedOrWithdrawn, total)}, Interview conv: ${pct(interviewConv, total)}, Offer rate: ${pct(offerCount, total)}, Ghosting: ${pct(ghostedCount, total)}`
    );
    lines.push(
      `Hired: ${hiredCount}, Rejected: ${rejectedCount}, Withdrawn: ${withdrawnCount}`
    );

    // Top 3 sources
    const sourceCounts: Record<string, number> = {};
    for (const app of applications) {
      if (app.source) {
        sourceCounts[app.source] = (sourceCounts[app.source] || 0) + 1;
      }
    }
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s, c]) => `${s}(${c})`)
      .join(", ");
    if (topSources) lines.push(`Top sources: ${topSources}`);

    // Avg salary
    const withSalary = applications.filter((a) => a.salaryMin);
    if (withSalary.length > 0) {
      const avg = Math.round(
        withSalary.reduce((s, a) => s + (a.salaryMin || 0), 0) /
          withSalary.length
      );
      lines.push(`Avg salaryMin: ₱${avg.toLocaleString()}`);
    }

    // Weekly growth
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(
      now.getTime() - 14 * 24 * 60 * 60 * 1000
    );
    const thisWeek = applications.filter((a) => {
      const d = new Date(a.dateApplied);
      return d >= sevenDaysAgo;
    }).length;
    const lastWeek = applications.filter((a) => {
      const d = new Date(a.dateApplied);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;
    lines.push(`Weekly growth: ${thisWeek} this week vs ${lastWeek} prior week`);

    // Recent 5
    const sorted = [...applications].sort(
      (a, b) =>
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    );
    lines.push("Recent 5:");
    for (const app of sorted.slice(0, 5)) {
      lines.push(
        `- ${app.companyName} | ${app.position} | ${STAGE_LABELS[app.stage] || app.stage} | ${manilaDate(app.dateApplied)}`
      );
    }
  }

  // ═══════════════════════════════════════════
  // CALENDAR
  // ═══════════════════════════════════════════
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingInterviews = applications.filter((app) => {
    if (!app.interviewDate) return false;
    const d = new Date(
      new Date(app.interviewDate).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      })
    );
    return d >= now && d <= weekFromNow;
  });

  const todayInterviews = upcomingInterviews.filter((app) => {
    const d = new Date(
      new Date(app.interviewDate!).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      })
    );
    return isSameDay(d, now);
  });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const pastInterviewsThisMonth = applications.filter((app) => {
    if (!app.interviewDate) return false;
    const d = new Date(
      new Date(app.interviewDate).toLocaleString("en-US", {
        timeZone: "Asia/Manila",
      })
    );
    return d >= monthStart && d < now;
  }).length;

  lines.push("");
  if (todayInterviews.length > 0) {
    lines.push(`CALENDAR: ${todayInterviews.length} interview(s) TODAY`);
    for (const app of todayInterviews) {
      lines.push(
        `- ${app.companyName} | ${app.position} | ${manilaDateTime(app.interviewDate)}`
      );
    }
  }
  if (upcomingInterviews.length > 0) {
    lines.push(`Upcoming 7 days: ${upcomingInterviews.length} interview(s)`);
    for (const app of upcomingInterviews.filter(
      (a) => !todayInterviews.includes(a)
    )) {
      lines.push(
        `- ${app.companyName} | ${app.position} | ${manilaDateTime(app.interviewDate)}`
      );
    }
  } else {
    lines.push("CALENDAR: No upcoming interviews");
  }
  lines.push(`Past interviews this month: ${pastInterviewsThisMonth}`);

  // ═══════════════════════════════════════════
  // KANBAN (active stages only)
  // ═══════════════════════════════════════════
  const activeApps = applications.filter(
    (a) => !TERMINAL_STAGES.includes(a.stage)
  );
  if (activeApps.length > 0) {
    const activeCounts: Record<string, number> = {};
    for (const app of activeApps) {
      activeCounts[app.stage] = (activeCounts[app.stage] || 0) + 1;
    }
    const kanbanStr = Object.entries(activeCounts)
      .map(([s, c]) => `${STAGE_LABELS[s] || s}(${c})`)
      .join(", ");
    lines.push(`\nKANBAN: ${activeApps.length} active — ${kanbanStr}`);
  }

  // ═══════════════════════════════════════════
  // ARCHIVE
  // ═══════════════════════════════════════════
  const archivedApps = applications.filter((a) =>
    TERMINAL_STAGES.includes(a.stage)
  );
  if (archivedApps.length > 0) {
    const archiveCounts: Record<string, number> = {};
    for (const app of archivedApps) {
      archiveCounts[app.stage] = (archiveCounts[app.stage] || 0) + 1;
    }
    const archiveStr = Object.entries(archiveCounts)
      .map(([s, c]) => `${STAGE_LABELS[s] || s}(${c})`)
      .join(", ");
    lines.push(`\nARCHIVE: ${archivedApps.length} total — ${archiveStr}`);

    const ghosted = archivedApps
      .filter((a) => a.stage === "ghosted")
      .slice(0, 5)
      .map((a) => a.companyName);
    if (ghosted.length > 0) lines.push(`Ghosted companies: ${ghosted.join(", ")}`);

    const rejected = archivedApps
      .filter((a) => a.stage === "rejected")
      .slice(0, 5)
      .map((a) => a.companyName);
    if (rejected.length > 0) lines.push(`Rejected companies: ${rejected.join(", ")}`);
  }

  // ═══════════════════════════════════════════
  // NOTES
  // ═══════════════════════════════════════════
  lines.push(`\nNOTES: ${notes.length} total`);
  if (notes.length > 0) {
    const last5 = notes.slice(0, 5);
    lines.push("Recent notes:");
    for (const n of last5) {
      lines.push(`- "${n.title}" (${manilaDate(n.createdAt)})`);
    }

    const todayNotes = notes
      .filter((n) => n.createdAt && isSameDay(new Date(n.createdAt), now))
      .map((n) => n.title);
    if (todayNotes.length > 0)
      lines.push(`Today's notes: ${todayNotes.join(", ")}`);

    const yesterdayNotes = notes
      .filter(
        (n) => n.createdAt && isYesterday(new Date(n.createdAt), now)
      )
      .map((n) => n.title);
    if (yesterdayNotes.length > 0)
      lines.push(`Yesterday's notes: ${yesterdayNotes.join(", ")}`);
  }

  // ═══════════════════════════════════════════
  // ACTIVITY LOGS
  // ═══════════════════════════════════════════
  if (activityLogs.length > 0) {
    lines.push(`\nACTIVITY: Last ${Math.min(activityLogs.length, 5)} actions`);
    for (const log of activityLogs.slice(0, 5)) {
      // description is JSON { summary, changes } — extract summary
      let desc = log.description;
      try {
        const parsed = JSON.parse(log.description) as { summary?: string };
        if (parsed.summary) desc = parsed.summary;
      } catch {
        // use raw description
      }
      lines.push(
        `- [${log.actionType}] ${desc} (${manilaDate(log.createdAt)})`
      );
    }
  }

  // ═══════════════════════════════════════════
  // EMAIL TEMPLATES (static note)
  // ═══════════════════════════════════════════
  lines.push(
    "\nEMAIL TEMPLATES: Read-only library at /dashboard/email-templates. Categories: Follow-up, Interview, Offer-Accept, Offer-Decline. Direct user there to browse and copy. Never generate raw email content."
  );

  // ═══════════════════════════════════════════
  // REMINDERS
  // ═══════════════════════════════════════════
  const todayStr = now.toISOString().slice(0, 10);
  const interviewRemindersToday = notificationLogs.filter(
    (n) =>
      n.notificationType === "interview_reminder" &&
      n.sentAt &&
      new Date(n.sentAt).toISOString().slice(0, 10) === todayStr
  ).length;
  const followUpRemindersToday = notificationLogs.filter(
    (n) =>
      n.notificationType === "follow_up_reminder" &&
      n.sentAt &&
      new Date(n.sentAt).toISOString().slice(0, 10) === todayStr
  ).length;
  const staleRemindersToday = notificationLogs.filter(
    (n) =>
      n.notificationType === "stale_application_reminder" &&
      n.sentAt &&
      new Date(n.sentAt).toISOString().slice(0, 10) === todayStr
  ).length;

  lines.push(
    `\nREMINDERS: Today — ${interviewRemindersToday} interview, ${followUpRemindersToday} follow-up, ${staleRemindersToday} stale reminders sent`
  );

  // Overdue follow-ups (non-terminal only)
  const overdueFollowUps = applications.filter((a) => {
    if (!a.followUpDate || TERMINAL_STAGES.includes(a.stage)) return false;
    return new Date(a.followUpDate) < now;
  });
  if (overdueFollowUps.length > 0) {
    lines.push(`Overdue follow-ups: ${overdueFollowUps.length}`);
    for (const app of overdueFollowUps.slice(0, 5)) {
      lines.push(
        `- ${app.companyName} | due ${manilaDate(app.followUpDate)}`
      );
    }
  }

  // Stale applications (20+ days no update, non-terminal)
  const staleApps = applications.filter((a) => {
    if (TERMINAL_STAGES.includes(a.stage) || !a.updatedAt) return false;
    return daysBetween(now, new Date(a.updatedAt)) >= 20;
  });
  if (staleApps.length > 0) {
    lines.push(`Stale (20+ days): ${staleApps.length}`);
    for (const app of staleApps.slice(0, 5)) {
      lines.push(
        `- ${app.companyName} | last updated ${manilaDate(app.updatedAt)}`
      );
    }
  }

  // ═══════════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════════
  const resumeCount = documents.filter((d) => d.type === "resume").length;
  const coverLetterCount = documents.filter(
    (d) => d.type === "cover_letter"
  ).length;
  const otherDocCount = documents.filter((d) => d.type === "other").length;

  lines.push(
    `\nDOCUMENTS: ${documents.length} total — ${resumeCount} resume(s), ${coverLetterCount} cover letter(s), ${otherDocCount} other`
  );
  if (documents.length > 0) {
    // Most recently uploaded
    const sorted = [...documents].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    const latest = sorted[0];
    lines.push(
      `Latest: "${latest.name}" (${latest.type}) uploaded ${manilaDate(latest.createdAt)}`
    );
  }
  lines.push("Manage documents at /dashboard/resume");

  return lines.join("\n");
}
