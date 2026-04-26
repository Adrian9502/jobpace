"use server";

import { db } from "./db";
import { jobApplications, jobActivityLogs } from "./schema";
import { getUserId } from "./auth-helpers";
import { getApplicationById } from "./queries";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatMoney, formatDate } from "./utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ActionResult = {
  success: boolean;
  error?: string;
  changes?: string[];
};

interface ChangeEntry {
  field: string;
  from: string | null;
  to: string | null;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

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

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/activity");
}

/** Parse and trim common form fields to reduce repetitive `formData.get()` casts. */
function parseApplicationForm(formData: FormData) {
  const companyName = (formData.get("companyName") as string)?.trim() || "";
  const position = (formData.get("position") as string)?.trim() || "";
  const dateAppliedRaw = formData.get("dateApplied") as string;
  const salaryMinRaw = formData.get("salaryMin") as string;
  const salaryMaxRaw = formData.get("salaryMax") as string;
  const followUpDateRaw = formData.get("followUpDate") as string;

  return {
    companyName,
    position,
    dateAppliedRaw,
    location: (formData.get("location") as string)?.trim() || null,
    workSetup: (formData.get("workSetup") as string) || null,
    employmentType: (formData.get("employmentType") as string) || null,
    salaryMin: salaryMinRaw ? parseInt(salaryMinRaw, 10) : null,
    salaryMax: salaryMaxRaw ? parseInt(salaryMaxRaw, 10) : null,
    status: (formData.get("status") as string) || "applied",
    source: (formData.get("source") as string) || null,
    applicationLink: (formData.get("applicationLink") as string)?.trim() || null,
    dateApplied: dateAppliedRaw ? new Date(dateAppliedRaw) : null,
    followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
    jobDescription: (formData.get("jobDescription") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
  };
}

function validateRequired(fields: { companyName: string; position: string; dateApplied: Date | null }): string | null {
  if (!fields.companyName) return "Company name is required.";
  if (!fields.position) return "Position is required.";
  if (!fields.dateApplied) return "Date applied is required.";
  return null;
}

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────

export async function createApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = parseApplicationForm(formData);

    const validationError = validateRequired(parsed);
    if (validationError) return { success: false, error: validationError };

    const [newApp] = await db.insert(jobApplications).values({
      userId,
      companyName: parsed.companyName,
      position: parsed.position,
      location: parsed.location,
      workSetup: parsed.workSetup,
      employmentType: parsed.employmentType,
      salaryMin: parsed.salaryMin,
      salaryMax: parsed.salaryMax,
      status: parsed.status,
      source: parsed.source,
      applicationLink: parsed.applicationLink,
      dateApplied: parsed.dateApplied!,
      followUpDate: parsed.followUpDate,
      jobDescription: parsed.jobDescription,
      notes: parsed.notes,
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
      ["Date Applied", formatDate(newApp.dateApplied)],
      ["Follow-up Date", formatDate(newApp.followUpDate)],
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

    revalidateDashboard();
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
    const parsed = parseApplicationForm(formData);

    const validationError = validateRequired(parsed);
    if (validationError) return { success: false, error: validationError };

    const oldApp = await getApplicationById(id);
    if (!oldApp || oldApp.userId !== userId) {
      return { success: false, error: "Application not found." };
    }

    const updates = {
      companyName: parsed.companyName,
      position: parsed.position,
      location: parsed.location,
      workSetup: parsed.workSetup,
      employmentType: parsed.employmentType,
      salaryMin: parsed.salaryMin,
      salaryMax: parsed.salaryMax,
      status: parsed.status,
      source: parsed.source,
      applicationLink: parsed.applicationLink,
      dateApplied: parsed.dateApplied!,
      followUpDate: parsed.followUpDate,
      jobDescription: parsed.jobDescription,
      notes: parsed.notes,
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

    const oldFollow = formatDate(oldApp.followUpDate);
    const newFollow = formatDate(updates.followUpDate);
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

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("updateApplication error:", err);
    return { success: false, error: "Failed to update application." };
  }
}

// ──────────────────────────────────────────────
// UPDATE STATUS (partial / fast)
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

    revalidateDashboard();
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

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("deleteApplication error:", err);
    return { success: false, error: "Failed to delete application." };
  }
}
