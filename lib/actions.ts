"use server";

import { db } from "./db";
import { jobApplications, jobActivityLogs } from "./schema";
import { auth } from "./auth";
import { DEV_USER } from "./dev-auth";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  const session = isDev ? DEV_USER : await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export type ApplicationRow = typeof jobApplications.$inferSelect;

// ──────────────────────────────────────────────
// LOGGING HELPER
// ──────────────────────────────────────────────

interface ChangeEntry {
  field: string;
  from: string | null;
  to: string | null;
}

async function logActivity(
  userId: string,
  actionType: string,
  summary: string,
  applicationId?: string,
  changes: ChangeEntry[] = []
) {
  try {
    const description = JSON.stringify({ summary, changes });
    await db.insert(jobActivityLogs).values({
      userId,
      actionType,
      description,
      applicationId: applicationId || null,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

// ──────────────────────────────────────────────
// READ
// ──────────────────────────────────────────────

export async function getApplications(): Promise<ApplicationRow[]> {
  const userId = await getUserId();

  return db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .orderBy(desc(jobApplications.dateApplied));
}

export async function getApplicationById(
  id: string
): Promise<ApplicationRow | undefined> {
  const userId = await getUserId();

  const rows = await db
    .select()
    .from(jobApplications)
    .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)))
    .limit(1);

  return rows[0];
}

export async function getActivityLogs() {
  const userId = await getUserId();

  return db
    .select()
    .from(jobActivityLogs)
    .where(eq(jobActivityLogs.userId, userId))
    .orderBy(desc(jobActivityLogs.createdAt));
}

// ──────────────────────────────────────────────
// STATS (for dashboard)
// ──────────────────────────────────────────────

export type ApplicationStats = {
  total: number;
  interviews: number;
  offers: number;
  followUpsDue: number;
};

export async function getApplicationStats(): Promise<ApplicationStats> {
  const userId = await getUserId();

  const rows = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    total: rows.length,
    interviews: rows.filter((r) => r.status === "interview").length,
    offers: rows.filter((r) => r.status === "offer").length,
    followUpsDue: rows.filter(
      (r) => r.followUpDate && r.followUpDate <= weekFromNow && r.followUpDate >= now
    ).length,
  };
}

export type KanbanCounts = Record<string, number>;

export async function getKanbanCounts(): Promise<KanbanCounts> {
  const userId = await getUserId();

  const rows = await db
    .select({ status: jobApplications.status, count: sql<number>`count(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .groupBy(jobApplications.status);

  const counts: KanbanCounts = {};
  for (const row of rows) {
    counts[row.status] = Number(row.count);
  }
  return counts;
}

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────

export type ActionResult = {
  success: boolean;
  error?: string;
  changes?: string[];
};

function formatMoney(amount: number | null | undefined): string {
  if (!amount) return "";
  return `₱${amount.toLocaleString()}`;
}

function formatDateDisplay(date: Date | null | undefined | string): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export async function createApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    const companyName = formData.get("companyName") as string;
    const position = formData.get("position") as string;
    const dateAppliedRaw = formData.get("dateApplied") as string;

    // Validate required fields
    if (!companyName?.trim()) {
      return { success: false, error: "Company name is required." };
    }
    if (!position?.trim()) {
      return { success: false, error: "Position is required." };
    }
    if (!dateAppliedRaw) {
      return { success: false, error: "Date applied is required." };
    }

    const salaryMinRaw = formData.get("salaryMin") as string;
    const salaryMaxRaw = formData.get("salaryMax") as string;
    const followUpDateRaw = formData.get("followUpDate") as string;

    const company = companyName.trim();

    const [newApp] = await db.insert(jobApplications).values({
      userId,
      companyName: company,
      position: position.trim(),
      location: (formData.get("location") as string)?.trim() || null,
      workSetup: (formData.get("workSetup") as string) || null,
      employmentType: (formData.get("employmentType") as string) || null,
      salaryMin: salaryMinRaw ? parseInt(salaryMinRaw, 10) : null,
      salaryMax: salaryMaxRaw ? parseInt(salaryMaxRaw, 10) : null,
      status: (formData.get("status") as string) || "applied",
      source: (formData.get("source") as string) || null,
      applicationLink: (formData.get("applicationLink") as string)?.trim() || null,
      dateApplied: new Date(dateAppliedRaw),
      followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
      jobDescription:
        (formData.get("jobDescription") as string)?.trim() || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    }).returning();

    const changes: ChangeEntry[] = [];
    const fields: [string, string | null][] = [
      ["Company Name", newApp.companyName],
      ["Position", newApp.position],
      ["Location", newApp.location],
      ["Work Setup", newApp.workSetup],
      ["Employment Type", newApp.employmentType],
      ["Salary", newApp.salaryMin || newApp.salaryMax ? `${formatMoney(newApp.salaryMin)} - ${formatMoney(newApp.salaryMax)}` : null],
      ["Status", newApp.status],
      ["Source", newApp.source],
      ["Application Link", newApp.applicationLink],
      ["Date Applied", formatDateDisplay(newApp.dateApplied)],
      ["Follow-up Date", formatDateDisplay(newApp.followUpDate)],
      ["Job Description", newApp.jobDescription ? "(provided)" : null],
      ["Notes", newApp.notes ? "(provided)" : null],
    ];

    for (const [key, val] of fields) {
      if (val) changes.push({ field: key, from: null, to: val });
    }

    await logActivity(
      userId,
      "CREATE",
      `Applied for ${newApp.position} at ${newApp.companyName}`,
      newApp.id,
      changes
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/activity");

    return { success: true };
  } catch (err) {
    console.error("createApplication error:", err);
    return { success: false, error: "Failed to create application." };
  }
}

// ──────────────────────────────────────────────
// UPDATE
// ──────────────────────────────────────────────

export async function updateApplication(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    const companyName = formData.get("companyName") as string;
    const position = formData.get("position") as string;
    const dateAppliedRaw = formData.get("dateApplied") as string;

    if (!companyName?.trim()) {
      return { success: false, error: "Company name is required." };
    }
    if (!position?.trim()) {
      return { success: false, error: "Position is required." };
    }
    if (!dateAppliedRaw) {
      return { success: false, error: "Date applied is required." };
    }

    const salaryMinRaw = formData.get("salaryMin") as string;
    const salaryMaxRaw = formData.get("salaryMax") as string;
    const followUpDateRaw = formData.get("followUpDate") as string;

    const company = companyName.trim();

    const oldApp = await getApplicationById(id);
    if (!oldApp || oldApp.userId !== userId) {
      return { success: false, error: "Application not found." };
    }

    // Capture new values
    const newLocation = (formData.get("location") as string)?.trim() || null;
    const newWorkSetup = (formData.get("workSetup") as string) || null;
    const newEmploymentType = (formData.get("employmentType") as string) || null;
    const newSalaryMin = salaryMinRaw ? parseInt(salaryMinRaw, 10) : null;
    const newSalaryMax = salaryMaxRaw ? parseInt(salaryMaxRaw, 10) : null;
    const newStatus = (formData.get("status") as string) || "applied";
    const newSource = (formData.get("source") as string) || null;
    const newApplicationLink = (formData.get("applicationLink") as string)?.trim() || null;
    const newDateApplied = new Date(dateAppliedRaw);
    const newFollowUpDate = followUpDateRaw ? new Date(followUpDateRaw) : null;
    const newJobDescription = (formData.get("jobDescription") as string)?.trim() || null;
    const newNotes = (formData.get("notes") as string)?.trim() || null;

    const updates = {
      companyName: company,
      position: position.trim(),
      location: newLocation,
      workSetup: newWorkSetup,
      employmentType: newEmploymentType,
      salaryMin: newSalaryMin,
      salaryMax: newSalaryMax,
      status: newStatus,
      source: newSource,
      applicationLink: newApplicationLink,
      dateApplied: newDateApplied,
      followUpDate: newFollowUpDate,
      jobDescription: newJobDescription,
      notes: newNotes,
      updatedAt: new Date(),
    };

    await db
      .update(jobApplications)
      .set(updates)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId))
      );

    const changes: ChangeEntry[] = [];

    if (oldApp.companyName !== updates.companyName)
      changes.push({ field: "Company Name", from: oldApp.companyName, to: updates.companyName });
    if (oldApp.position !== updates.position)
      changes.push({ field: "Position", from: oldApp.position, to: updates.position });
    if (oldApp.location !== updates.location)
      changes.push({ field: "Location", from: oldApp.location || "None", to: updates.location || "None" });
    if (oldApp.workSetup !== updates.workSetup)
      changes.push({ field: "Work Setup", from: oldApp.workSetup || "None", to: updates.workSetup || "None" });

    const oldSal = oldApp.salaryMin || oldApp.salaryMax ? `${formatMoney(oldApp.salaryMin)} - ${formatMoney(oldApp.salaryMax)}` : "None";
    const newSal = updates.salaryMin || updates.salaryMax ? `${formatMoney(updates.salaryMin)} - ${formatMoney(updates.salaryMax)}` : "None";
    if (oldSal !== newSal)
      changes.push({ field: "Salary", from: oldSal, to: newSal });

    if (oldApp.status !== updates.status)
      changes.push({ field: "Status", from: oldApp.status, to: updates.status });
    if (oldApp.source !== updates.source)
      changes.push({ field: "Source", from: oldApp.source || "None", to: updates.source || "None" });

    const oldFollow = formatDateDisplay(oldApp.followUpDate);
    const newFollow = formatDateDisplay(updates.followUpDate);
    if (oldFollow !== newFollow)
      changes.push({ field: "Follow-up Date", from: oldFollow || "None", to: newFollow || "None" });

    if (oldApp.jobDescription !== updates.jobDescription)
      changes.push({ field: "Job Description", from: oldApp.jobDescription ? "(provided)" : "None", to: updates.jobDescription ? "(provided)" : "None" });

    if (oldApp.notes !== updates.notes)
      changes.push({ field: "Notes", from: oldApp.notes ? "(provided)" : "None", to: updates.notes ? "(provided)" : "None" });

    if (changes.length > 0) {
      await logActivity(
        userId,
        "UPDATE",
        `Updated ${oldApp.position} at ${oldApp.companyName}`,
        id,
        changes
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/activity");

    return { success: true };
  } catch (err) {
    console.error("updateApplication error:", err);
    return { success: false, error: "Failed to update application." };
  }
}

// ──────────────────────────────────────────────
// UPDATE (PARTIAL / FAST)
// ──────────────────────────────────────────────

export async function updateApplicationStatus(
  id: string,
  newStatus: string
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    
    const oldApp = await getApplicationById(id);

    await db
      .update(jobApplications)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));
      
    const msg = `Status changed from ${oldApp?.status || "Unknown"} to ${newStatus}`;
    await logActivity(
      userId,
      "STATUS_CHANGE",
      msg,
      id,
      [{ field: "Status", from: oldApp?.status || "Unknown", to: newStatus }]
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/kanban");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/activity");

    return { success: true };
  } catch (err) {
    console.error("updateStatus error:", err);
    return { success: false, error: "Failed to update status." };
  }
}

// ──────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    const existing = await getApplicationById(id);

    await db
      .delete(jobApplications)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId))
      );
      
    if (existing) {
      await logActivity(
        userId,
        "DELETE",
        `Deleted application for ${existing.companyName}`,
        undefined,
        [{ field: "Application", from: `${existing.position} at ${existing.companyName}`, to: null }]
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/activity");

    return { success: true };
  } catch (err) {
    console.error("deleteApplication error:", err);
    return { success: false, error: "Failed to delete application." };
  }
}
