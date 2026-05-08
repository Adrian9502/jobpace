"use server";

import { db } from "../db";
import { jobApplications } from "../schema";
import { getUserId } from "../auth-helpers";
import { getApplicationById } from "../queries";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatMoney, formatDate } from "../utils";
import { STAGE_CONFIG, FINAL_STAGES } from "../constants";
import { logActivity } from "./activity";
import { applicationSchema } from "../validations/applications";
import type { ActionResult } from "./notes";

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard/activity");
}

function parseApplicationForm(formData: FormData) {
  const dateAppliedRaw = formData.get("dateApplied") as string;
  const followUpDateRaw = formData.get("followUpDate") as string;
  const interviewDateRaw = formData.get("interviewDate") as string;
  const salaryMinRaw = formData.get("salaryMin") as string;
  const salaryMaxRaw = formData.get("salaryMax") as string;

  return {
    companyName: (formData.get("companyName") as string)?.trim() || "",
    position: (formData.get("position") as string)?.trim() || "",
    location: (formData.get("location") as string)?.trim() || null,
    workSetup: (formData.get("workSetup") as string) || null,
    employmentType: (formData.get("employmentType") as string) || null,
    salaryMin: salaryMinRaw ? parseInt(salaryMinRaw, 10) : null,
    salaryMax: salaryMaxRaw ? parseInt(salaryMaxRaw, 10) : null,
    stage: (formData.get("stage") as string) || "applied",
    status: (formData.get("status") as string) || "pending",
    source: (formData.get("source") as string) || null,
    applicationLink: (formData.get("applicationLink") as string)?.trim() || null,
    dateApplied: dateAppliedRaw ? new Date(dateAppliedRaw) : undefined, // required, let zod catch if missing
    followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
    interviewDate: interviewDateRaw ? new Date(interviewDateRaw) : null,
    contactName: (formData.get("contactName") as string)?.trim() || null,
    contactEmail: (formData.get("contactEmail") as string)?.trim() || null,
    jobDescription: (formData.get("jobDescription") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
    companyResearch: (formData.get("companyResearch") as string)?.trim() || null,
  };
}

export async function createApplication(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const rawData = parseApplicationForm(formData);

    const parsed = applicationSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const [{ value: userAppCount }] = await db
      .select({ value: count() })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));

    if (userAppCount >= 200) {
      return { success: false, error: "Maximum limit of 200 applications reached." };
    }

    const data = parsed.data;

    const [newApp] = await db
      .insert(jobApplications)
      .values({
        userId,
        ...data,
        status: FINAL_STAGES.includes(data.stage as any) ? null : data.status,
      })
      .returning();

    const stageLabel = STAGE_CONFIG[newApp.stage as keyof typeof STAGE_CONFIG]?.label ?? newApp.stage;

    const changes = [];
    const fields: [string, string | null][] = [
      ["Company Name", newApp.companyName],
      ["Position", newApp.position],
      ["Location", newApp.location],
      ["Work Setup", newApp.workSetup],
      ["Employment Type", newApp.employmentType],
      ["Salary", newApp.salaryMin || newApp.salaryMax ? `${formatMoney(newApp.salaryMin)} - ${formatMoney(newApp.salaryMax)}` : null],
      ["Stage", stageLabel],
      ["Status", newApp.status],
      ["Source", newApp.source],
      ["Application Link", newApp.applicationLink],
      ["Date Applied", formatDate(newApp.dateApplied)],
      ["Follow-up Date", formatDate(newApp.followUpDate)],
      ["Interview Date", formatDate(newApp.interviewDate)],
      ["Contact Name", newApp.contactName],
      ["Contact Email", newApp.contactEmail],
      ["Job Description", newApp.jobDescription ? "(provided)" : null],
      ["Notes", newApp.notes ? "(provided)" : null],
      ["Company Research", newApp.companyResearch ? "(provided)" : null],
    ];

    for (const [key, val] of fields) {
      if (val) changes.push({ field: key, from: null, to: val });
    }

    await logActivity(userId, "CREATE", `Applied for ${newApp.position} at ${newApp.companyName}`, newApp.id, changes);

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("createApplication error:", err);
    return { success: false, error: "Failed to create application." };
  }
}

export async function updateApplication(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const rawData = parseApplicationForm(formData);

    const parsed = applicationSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const oldApp = await getApplicationById(id);
    if (!oldApp || oldApp.userId !== userId) {
      return { success: false, error: "Application not found." };
    }

    const data = parsed.data;

    const updates = {
      ...data,
      status: FINAL_STAGES.includes(data.stage as any) ? null : data.status,
      updatedAt: new Date(),
    };

    await db
      .update(jobApplications)
      .set(updates)
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));

    const changes = [];

    if (oldApp.companyName !== updates.companyName) changes.push({ field: "Company Name", from: oldApp.companyName, to: updates.companyName });
    if (oldApp.position !== updates.position) changes.push({ field: "Position", from: oldApp.position, to: updates.position });
    if (oldApp.location !== updates.location) changes.push({ field: "Location", from: oldApp.location || "None", to: updates.location || "None" });
    if (oldApp.workSetup !== updates.workSetup) changes.push({ field: "Work Setup", from: oldApp.workSetup || "None", to: updates.workSetup || "None" });

    const oldSal = oldApp.salaryMin || oldApp.salaryMax ? `${formatMoney(oldApp.salaryMin)} - ${formatMoney(oldApp.salaryMax)}` : "None";
    const newSal = updates.salaryMin || updates.salaryMax ? `${formatMoney(updates.salaryMin)} - ${formatMoney(updates.salaryMax)}` : "None";
    if (oldSal !== newSal) changes.push({ field: "Salary", from: oldSal, to: newSal });

    if (oldApp.stage !== updates.stage) changes.push({ field: "Stage", from: oldApp.stage, to: updates.stage });
    if (oldApp.status !== updates.status) changes.push({ field: "Status", from: oldApp.status, to: updates.status });
    if (oldApp.source !== updates.source) changes.push({ field: "Source", from: oldApp.source || "None", to: updates.source || "None" });

    const oldFollow = formatDate(oldApp.followUpDate);
    const newFollow = formatDate(updates.followUpDate);
    if (oldFollow !== newFollow) changes.push({ field: "Follow-up Date", from: oldFollow || "None", to: newFollow || "None" });

    if (oldApp.jobDescription !== updates.jobDescription) changes.push({ field: "Job Description", from: oldApp.jobDescription ? "(provided)" : "None", to: updates.jobDescription ? "(provided)" : "None" });
    if (oldApp.notes !== updates.notes) changes.push({ field: "Notes", from: oldApp.notes ? "(provided)" : "None", to: updates.notes ? "(provided)" : "None" });
    if (oldApp.companyResearch !== updates.companyResearch) changes.push({ field: "Company Research", from: oldApp.companyResearch ? "(provided)" : "None", to: updates.companyResearch ? "(provided)" : "None" });

    const oldInt = formatDate(oldApp.interviewDate);
    const newInt = formatDate(updates.interviewDate);
    if (oldInt !== newInt) changes.push({ field: "Interview Date", from: oldInt || "None", to: newInt || "None" });
    
    if (oldApp.contactName !== updates.contactName) changes.push({ field: "Contact Name", from: oldApp.contactName || "None", to: updates.contactName || "None" });
    if (oldApp.contactEmail !== updates.contactEmail) changes.push({ field: "Contact Email", from: oldApp.contactEmail || "None", to: updates.contactEmail || "None" });

    if (changes.length > 0) {
      await logActivity(userId, "UPDATE", `Updated ${oldApp.position} at ${oldApp.companyName}`, id, changes);
    }

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("updateApplication error:", err);
    return { success: false, error: "Failed to update application." };
  }
}

export async function updateApplicationStage(id: string, newStage: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const oldApp = await getApplicationById(id);
    if (!oldApp || oldApp.userId !== userId) {
      return { success: false, error: "Application not found." };
    }

    await db
      .update(jobApplications)
      .set({
        stage: newStage,
        status: FINAL_STAGES.includes(newStage as any) ? null : "pending",
        updatedAt: new Date(),
      })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));

    const oldStageLabel = STAGE_CONFIG[oldApp.stage as keyof typeof STAGE_CONFIG]?.label ?? oldApp.stage;
    const newStageLabel = STAGE_CONFIG[newStage as keyof typeof STAGE_CONFIG]?.label ?? newStage;

    const msg = `Stage changed from ${oldStageLabel} to ${newStageLabel}`;
    await logActivity(userId, "STATUS_CHANGE", msg, id, [
      { field: "Stage", from: oldApp.stage, to: newStage },
      { field: "Status", from: oldApp.status || "Unknown", to: FINAL_STAGES.includes(newStage as any) ? null : "pending" },
    ]);

    revalidateDashboard();

    const newStatusMsg = FINAL_STAGES.includes(newStage as any) ? "" : " — status changed to Pending";
    return { success: true, changes: [`${oldApp.companyName} moved to ${newStageLabel}${newStatusMsg}`] };
  } catch (err) {
    console.error("updateStage error:", err);
    return { success: false, error: "Failed to update stage." };
  }
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await getApplicationById(id);

    await db
      .delete(jobApplications)
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));

    if (existing) {
      await logActivity(userId, "DELETE", `Deleted application for ${existing.companyName}`, undefined, [
        { field: "Application", from: `${existing.position} at ${existing.companyName}`, to: null },
      ]);
    }

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("deleteApplication error:", err);
    return { success: false, error: "Failed to delete application." };
  }
}

export async function restoreApplication(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const oldApp = await getApplicationById(id);
    
    if (!oldApp || oldApp.userId !== userId) {
      return { success: false, error: "Application not found." };
    }

    await db
      .update(jobApplications)
      .set({
        stage: "applied",
        status: "pending",
        updatedAt: new Date(),
      })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));

    const oldStageLabel = STAGE_CONFIG[oldApp.stage as keyof typeof STAGE_CONFIG]?.label ?? oldApp.stage;
    const msg = `Restored application from ${oldStageLabel} to Applied`;
    
    await logActivity(userId, "STATUS_CHANGE", msg, id, [
      { field: "Stage", from: oldApp.stage, to: "applied" },
      { field: "Status", from: oldApp.status || "Unknown", to: "pending" },
    ]);

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("restoreApplication error:", err);
    return { success: false, error: "Failed to restore application." };
  }
}
