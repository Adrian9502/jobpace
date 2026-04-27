import { db } from "./db";
import { jobApplications, jobActivityLogs } from "./schema";
import { getUserId } from "./auth-helpers";
import { eq, desc, and, sql } from "drizzle-orm";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ApplicationRow = typeof jobApplications.$inferSelect;

export type ApplicationStats = {
  total: number;
  interviews: number;
  offers: number;
  followUpsDue: number;
};

export type KanbanCounts = Record<string, number>;

// ──────────────────────────────────────────────
// Queries
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
    interviews: rows.filter(
      (r) => r.stage === "interview" || r.stage === "final_interview"
    ).length,
    offers: rows.filter((r) => r.stage === "offer").length,
    followUpsDue: rows.filter(
      (r) => r.followUpDate && r.followUpDate <= weekFromNow && r.followUpDate >= now
    ).length,
  };
}

export async function getKanbanCounts(): Promise<KanbanCounts> {
  const userId = await getUserId();

  const rows = await db
    .select({ stage: jobApplications.stage, count: sql<number>`count(*)` })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .groupBy(jobApplications.stage);

  const counts: KanbanCounts = {};
  for (const row of rows) {
    counts[row.stage] = Number(row.count);
  }
  return counts;
}
