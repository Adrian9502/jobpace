"use server";

import { db } from "./db";
import { jobApplications, jobActivityLogs, personalNotes } from "./schema";

import { getUserId } from "./auth-helpers";
import { getApplicationById } from "./queries";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatMoney, formatDate, validateDateInBounds } from "./utils";
import { STAGE_CONFIG, FINAL_STAGES } from "./constants";
import { count } from "drizzle-orm";

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
  changes: ChangeEntry[] = [],
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

async function getNoteById(userId: string, noteId: string) {
  const rows = await db
    .select()
    .from(personalNotes)
    .where(and(eq(personalNotes.id, noteId), eq(personalNotes.userId, userId)))
    .limit(1);

  return rows[0];
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
  const interviewDateRaw = formData.get("interviewDate") as string;

  return {
    companyName,
    position,
    dateAppliedRaw,
    location: (formData.get("location") as string)?.trim() || null,
    workSetup: (formData.get("workSetup") as string) || null,
    employmentType: (formData.get("employmentType") as string) || null,
    salaryMin: salaryMinRaw ? parseInt(salaryMinRaw, 10) : null,
    salaryMax: salaryMaxRaw ? parseInt(salaryMaxRaw, 10) : null,
    stage: (formData.get("stage") as string) || "applied",
    status: (formData.get("status") as string) || "pending",
    source: (formData.get("source") as string) || null,
    applicationLink:
      (formData.get("applicationLink") as string)?.trim() || null,
    dateApplied: dateAppliedRaw ? new Date(dateAppliedRaw) : null,
    followUpDate: followUpDateRaw ? new Date(followUpDateRaw) : null,
    interviewDate: interviewDateRaw ? new Date(interviewDateRaw) : null,

    contactName: (formData.get("contactName") as string)?.trim() || null,
    contactEmail: (formData.get("contactEmail") as string)?.trim() || null,
    jobDescription: (formData.get("jobDescription") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
    companyResearch:
      (formData.get("companyResearch") as string)?.trim() || null,
  };
}

function validateRequired(fields: {
  companyName: string;
  position: string;
  dateApplied: Date | null;
}): string | null {
  if (!fields.companyName) return "Company name is required.";
  if (!fields.position) return "Position is required.";
  if (!fields.dateApplied) return "Date applied is required.";

  // Date bounds validation
  const dateError = validateDateInBounds(fields.dateApplied, "Date applied");
  if (dateError) return dateError;

  return null;
}

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────

export async function createApplication(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = parseApplicationForm(formData);

    const validationError = validateRequired(parsed);
    if (validationError) return { success: false, error: validationError };

    // Enforce maximum 200 applications per user limit
    const [{ value: userAppCount }] = await db
      .select({ value: count() })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));

    if (userAppCount >= 200) {
      return {
        success: false,
        error: "Maximum limit of 200 applications reached.",
      };
    }

    // Validate follow-up date if provided
    if (parsed.followUpDate) {
      const followUpError = validateDateInBounds(
        parsed.followUpDate,
        "Follow-up date",
      );
      if (followUpError) return { success: false, error: followUpError };
    }

    const [newApp] = await db
      .insert(jobApplications)
      .values({
        userId,
        companyName: parsed.companyName,
        position: parsed.position,
        location: parsed.location,
        workSetup: parsed.workSetup,
        employmentType: parsed.employmentType,
        salaryMin: parsed.salaryMin,
        salaryMax: parsed.salaryMax,
        stage: parsed.stage,
        status: FINAL_STAGES.includes(parsed.stage as any)
          ? null
          : parsed.status,
        source: parsed.source,
        applicationLink: parsed.applicationLink,
        dateApplied: parsed.dateApplied!,
        followUpDate: parsed.followUpDate,
        interviewDate: parsed.interviewDate,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        jobDescription: parsed.jobDescription,
        notes: parsed.notes,
        companyResearch: parsed.companyResearch,
      })
      .returning();

    const stageLabel =
      STAGE_CONFIG[newApp.stage as keyof typeof STAGE_CONFIG]?.label ??
      newApp.stage;

    const changes: ChangeEntry[] = [];
    const fields: [string, string | null][] = [
      ["Company Name", newApp.companyName],
      ["Position", newApp.position],
      ["Location", newApp.location],
      ["Work Setup", newApp.workSetup],
      ["Employment Type", newApp.employmentType],
      [
        "Salary",
        newApp.salaryMin || newApp.salaryMax
          ? `${formatMoney(newApp.salaryMin)} - ${formatMoney(newApp.salaryMax)}`
          : null,
      ],
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

    await logActivity(
      userId,
      "CREATE",
      `Applied for ${newApp.position} at ${newApp.companyName}`,
      newApp.id,
      changes,
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
  formData: FormData,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const parsed = parseApplicationForm(formData);

    const validationError = validateRequired(parsed);
    if (validationError) return { success: false, error: validationError };

    // Validate follow-up date if provided
    if (parsed.followUpDate) {
      const followUpError = validateDateInBounds(
        parsed.followUpDate,
        "Follow-up date",
      );
      if (followUpError) return { success: false, error: followUpError };
    }

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
      stage: parsed.stage,
      status: FINAL_STAGES.includes(parsed.stage as any) ? null : parsed.status,
      source: parsed.source,
      applicationLink: parsed.applicationLink,
      dateApplied: parsed.dateApplied!,
      followUpDate: parsed.followUpDate,
      interviewDate: parsed.interviewDate,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      jobDescription: parsed.jobDescription,
      notes: parsed.notes,
      companyResearch: parsed.companyResearch,
      updatedAt: new Date(),
    };

    await db
      .update(jobApplications)
      .set(updates)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
      );

    const changes: ChangeEntry[] = [];

    if (oldApp.companyName !== updates.companyName)
      changes.push({
        field: "Company Name",
        from: oldApp.companyName,
        to: updates.companyName,
      });
    if (oldApp.position !== updates.position)
      changes.push({
        field: "Position",
        from: oldApp.position,
        to: updates.position,
      });
    if (oldApp.location !== updates.location)
      changes.push({
        field: "Location",
        from: oldApp.location || "None",
        to: updates.location || "None",
      });
    if (oldApp.workSetup !== updates.workSetup)
      changes.push({
        field: "Work Setup",
        from: oldApp.workSetup || "None",
        to: updates.workSetup || "None",
      });

    const oldSal =
      oldApp.salaryMin || oldApp.salaryMax
        ? `${formatMoney(oldApp.salaryMin)} - ${formatMoney(oldApp.salaryMax)}`
        : "None";
    const newSal =
      updates.salaryMin || updates.salaryMax
        ? `${formatMoney(updates.salaryMin)} - ${formatMoney(updates.salaryMax)}`
        : "None";
    if (oldSal !== newSal)
      changes.push({ field: "Salary", from: oldSal, to: newSal });

    if (oldApp.stage !== updates.stage)
      changes.push({ field: "Stage", from: oldApp.stage, to: updates.stage });
    if (oldApp.status !== updates.status)
      changes.push({
        field: "Status",
        from: oldApp.status,
        to: updates.status,
      });
    if (oldApp.source !== updates.source)
      changes.push({
        field: "Source",
        from: oldApp.source || "None",
        to: updates.source || "None",
      });

    const oldFollow = formatDate(oldApp.followUpDate);
    const newFollow = formatDate(updates.followUpDate);
    if (oldFollow !== newFollow)
      changes.push({
        field: "Follow-up Date",
        from: oldFollow || "None",
        to: newFollow || "None",
      });

    if (oldApp.jobDescription !== updates.jobDescription)
      changes.push({
        field: "Job Description",
        from: oldApp.jobDescription ? "(provided)" : "None",
        to: updates.jobDescription ? "(provided)" : "None",
      });

    if (oldApp.notes !== updates.notes)
      changes.push({
        field: "Notes",
        from: oldApp.notes ? "(provided)" : "None",
        to: updates.notes ? "(provided)" : "None",
      });

    if (oldApp.companyResearch !== updates.companyResearch)
      changes.push({
        field: "Company Research",
        from: oldApp.companyResearch ? "(provided)" : "None",
        to: updates.companyResearch ? "(provided)" : "None",
      });

    const oldInt = formatDate(oldApp.interviewDate);
    const newInt = formatDate(updates.interviewDate);
    if (oldInt !== newInt)
      changes.push({
        field: "Interview Date",
        from: oldInt || "None",
        to: newInt || "None",
      });

    if (oldApp.contactName !== updates.contactName)
      changes.push({
        field: "Contact Name",
        from: oldApp.contactName || "None",
        to: updates.contactName || "None",
      });

    if (oldApp.contactEmail !== updates.contactEmail)
      changes.push({
        field: "Contact Email",
        from: oldApp.contactEmail || "None",
        to: updates.contactEmail || "None",
      });

    if (changes.length > 0) {
      await logActivity(
        userId,
        "UPDATE",
        `Updated ${oldApp.position} at ${oldApp.companyName}`,
        id,
        changes,
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
// UPDATE STAGE (Kanban drag-and-drop)
// ──────────────────────────────────────────────

export async function updateApplicationStage(
  id: string,
  newStage: string,
): Promise<ActionResult> {
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
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
      );

    const oldStageLabel =
      STAGE_CONFIG[oldApp.stage as keyof typeof STAGE_CONFIG]?.label ??
      oldApp.stage;
    const newStageLabel =
      STAGE_CONFIG[newStage as keyof typeof STAGE_CONFIG]?.label ?? newStage;

    const msg = `Stage changed from ${oldStageLabel} to ${newStageLabel}`;
    await logActivity(userId, "STATUS_CHANGE", msg, id, [
      { field: "Stage", from: oldApp.stage, to: newStage },
      {
        field: "Status",
        from: oldApp.status || "Unknown",
        to: FINAL_STAGES.includes(newStage as any) ? null : "pending",
      },
    ]);

    revalidateDashboard();

    const newStatusMsg = FINAL_STAGES.includes(newStage as any)
      ? ""
      : " — status changed to Pending";
    return {
      success: true,
      changes: [
        `${oldApp.companyName} moved to ${newStageLabel}${newStatusMsg}`,
      ],
    };
  } catch (err) {
    console.error("updateStage error:", err);
    return { success: false, error: "Failed to update stage." };
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
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)),
      );

    if (existing) {
      await logActivity(
        userId,
        "DELETE",
        `Deleted application for ${existing.companyName}`,
        undefined,
        [
          {
            field: "Application",
            from: `${existing.position} at ${existing.companyName}`,
            to: null,
          },
        ],
      );
    }

    revalidateDashboard();
    return { success: true };
  } catch (err) {
    console.error("deleteApplication error:", err);
    return { success: false, error: "Failed to delete application." };
  }
}

// ──────────────────────────────────────────────
// PERSONAL NOTES
// ──────────────────────────────────────────────

export async function createNote(
  title: string,
  content: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const [newNote] = await db
      .insert(personalNotes)
      .values({
        userId,
        title,
        content,
      })
      .returning();

    const changes: ChangeEntry[] = [];
    if (newNote?.title) {
      changes.push({ field: "Title", from: null, to: newNote.title });
    }
    if (newNote?.content) {
      changes.push({ field: "Content", from: null, to: "(provided)" });
    }

    await logActivity(
      userId,
      "CREATE",
      `Created note: ${newNote?.title || "Untitled"}`,
      undefined,
      changes,
    );
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("createNote error:", err);
    return { success: false, error: "Failed to create note." };
  }
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await getNoteById(userId, id);

    await db
      .update(personalNotes)
      .set({ title, content, updatedAt: new Date() })
      .where(and(eq(personalNotes.id, id), eq(personalNotes.userId, userId)));

    if (existing) {
      const changes: ChangeEntry[] = [];
      if (existing.title !== title) {
        changes.push({
          field: "Title",
          from: existing.title || "Untitled",
          to: title || "Untitled",
        });
      }

      const oldContent = existing.content ? "(provided)" : "None";
      const newContent = content ? "(provided)" : "None";
      if (oldContent !== newContent) {
        changes.push({ field: "Content", from: oldContent, to: newContent });
      }

      await logActivity(
        userId,
        "UPDATE",
        `Updated note: ${title || existing.title || "Untitled"}`,
        undefined,
        changes,
      );
    }
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("updateNote error:", err);
    return { success: false, error: "Failed to update note." };
  }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await getNoteById(userId, id);

    await db
      .delete(personalNotes)
      .where(and(eq(personalNotes.id, id), eq(personalNotes.userId, userId)));

    if (existing) {
      await logActivity(
        userId,
        "DELETE",
        `Deleted note: ${existing.title || "Untitled"}`,
        undefined,
        [{ field: "Note", from: existing.title || "Untitled", to: null }],
      );
    }
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("deleteNote error:", err);
    return { success: false, error: "Failed to delete note." };
  }
}
