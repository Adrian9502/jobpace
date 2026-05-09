"use server";

import { db } from "../db";
import { users, jobApplications } from "../schema";
import { getUserId } from "../auth-helpers";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { ActionResult } from "./notes";
import type { ParsedRow } from "../csv-helpers";

// ──────────────────────────────────────────────
// Profile
// ──────────────────────────────────────────────

export async function updateProfile(data: {
  name: string;
  username: string | null;
  image: string | null;
}): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    // Validate inputs
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: "Name is required." };
    }
    if (data.name.trim().length > 100) {
      return { success: false, error: "Name must be 100 characters or less." };
    }
    if (data.username && data.username.trim().length > 30) {
      return { success: false, error: "Username must be 30 characters or less." };
    }
    if (data.username && !/^[a-zA-Z0-9_-]+$/.test(data.username.trim())) {
      return { success: false, error: "Username can only contain letters, numbers, underscores, and hyphens." };
    }

    // Check username uniqueness if provided
    if (data.username) {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, data.username.trim()))
        .limit(1);
      if (existing.length > 0 && existing[0].id !== userId) {
        return { success: false, error: "This username is already taken." };
      }
    }

    await db
      .update(users)
      .set({
        name: data.name.trim(),
        username: data.username ? data.username.trim() : null,
        image: data.image,
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("updateProfile error:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

// ──────────────────────────────────────────────
// Email Preferences
// ──────────────────────────────────────────────

export async function updateEmailPreferences(data: {
  notifyInterview: boolean;
  notifyFollowUp: boolean;
  notifyStale: boolean;
}): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    await db
      .update(users)
      .set({
        notifyInterview: data.notifyInterview,
        notifyFollowUp: data.notifyFollowUp,
        notifyStale: data.notifyStale,
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    console.error("updateEmailPreferences error:", err);
    return { success: false, error: "Failed to update email preferences." };
  }
}

// ──────────────────────────────────────────────
// CSV Import
// ──────────────────────────────────────────────

export async function importApplications(
  rows: ParsedRow[]
): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    if (rows.length === 0) {
      return { success: false, error: "No valid rows to import." };
    }

    if (rows.length > 200) {
      return { success: false, error: "Cannot import more than 200 applications at once." };
    }

    // Fetch existing applications to detect duplicates
    const existingApps = await db
      .select({
        companyName: jobApplications.companyName,
        position: jobApplications.position,
        dateApplied: jobApplications.dateApplied,
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));

    // Build a fingerprint set: "companyName|position|YYYY-MM-DD"
    const existingFingerprints = new Set(
      existingApps.map((app) => {
        const dateStr = app.dateApplied.toISOString().split("T")[0];
        return `${app.companyName.toLowerCase()}|${app.position.toLowerCase()}|${dateStr}`;
      })
    );

    // Filter out duplicates
    const newRows = rows.filter((row) => {
      const dateStr = row.dateApplied.toISOString().split("T")[0];
      const fingerprint = `${row.companyName.toLowerCase()}|${row.position.toLowerCase()}|${dateStr}`;
      return !existingFingerprints.has(fingerprint);
    });

    const duplicateCount = rows.length - newRows.length;

    if (newRows.length === 0) {
      return {
        success: false,
        error: duplicateCount > 0
          ? `All ${duplicateCount} application${duplicateCount !== 1 ? "s" : ""} already exist in your account. No new data to import.`
          : "No valid rows to import.",
      };
    }

    // Check current count + new import count against limit
    const currentCount = existingApps.length;
    if (currentCount + newRows.length > 200) {
      return {
        success: false,
        error: `You currently have ${currentCount} applications. Importing ${newRows.length} more would exceed the 200 limit. Please remove some applications first.`,
      };
    }

    // Bulk insert only non-duplicate rows
    const values = newRows.map((row) => ({
      userId,
      companyName: row.companyName,
      position: row.position,
      location: row.location,
      workSetup: row.workSetup,
      employmentType: row.employmentType,
      salaryMin: row.salaryMin,
      salaryMax: row.salaryMax,
      stage: row.stage,
      status: row.status,
      source: row.source,
      applicationLink: row.applicationLink,
      dateApplied: row.dateApplied,
      followUpDate: row.followUpDate,
      interviewDate: row.interviewDate,
      contactName: row.contactName,
      contactEmail: row.contactEmail,
      jobDescription: row.jobDescription,
      notes: row.notes,
      companyResearch: row.companyResearch,
    }));

    await db.insert(jobApplications).values(values);

    // Log a single activity entry
    const dupMsg = duplicateCount > 0 ? ` (${duplicateCount} duplicate${duplicateCount !== 1 ? "s" : ""} skipped)` : "";
    await logActivity(
      userId,
      "IMPORT",
      `Bulk imported ${newRows.length} application${newRows.length !== 1 ? "s" : ""} via CSV${dupMsg}`,
      undefined,
      [{ field: "Applications Imported", from: null, to: String(newRows.length) }]
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/kanban");
    revalidatePath("/dashboard/activity");

    const successMsg = duplicateCount > 0
      ? `Imported ${newRows.length} application${newRows.length !== 1 ? "s" : ""}. ${duplicateCount} duplicate${duplicateCount !== 1 ? "s were" : " was"} skipped.`
      : undefined;

    return { success: true, changes: successMsg ? [successMsg] : undefined };
  } catch (err) {
    console.error("importApplications error:", err);
    return { success: false, error: "Failed to import applications." };
  }
}
