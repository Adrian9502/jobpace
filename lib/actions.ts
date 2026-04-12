"use server";

import { db } from "./db";
import { jobApplications } from "./schema";
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
};

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

    await db.insert(jobApplications).values({
      userId,
      companyName: companyName.trim(),
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
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");

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

    await db
      .update(jobApplications)
      .set({
        companyName: companyName.trim(),
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
        updatedAt: new Date(),
      })
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId))
      );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");

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
    
    await db
      .update(jobApplications)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(jobApplications.id, id), eq(jobApplications.userId, userId)));
      
    // Revalidate dashboard and kanban paths to ensure accurate counts
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/kanban");
    revalidatePath("/dashboard/applications");
    
    return { success: true };
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return { success: false, error: "Failed to update status." };
  }
}

// ──────────────────────────────────────────────
// DELETE
// ──────────────────────────────────────────────

export async function deleteApplication(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();

    await db
      .delete(jobApplications)
      .where(
        and(eq(jobApplications.id, id), eq(jobApplications.userId, userId))
      );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/applications");

    return { success: true };
  } catch (err) {
    console.error("deleteApplication error:", err);
    return { success: false, error: "Failed to delete application." };
  }
}
