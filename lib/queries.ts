import { db } from "./db";
import { jobApplications, jobActivityLogs, personalNotes } from "./schema";
import { getUserId } from "./auth-helpers";
import { eq, desc, and, sql } from "drizzle-orm";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ApplicationRow = typeof jobApplications.$inferSelect;
export type PersonalNoteRow = typeof personalNotes.$inferSelect;


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
  id: string,
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

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      interviews: sql<number>`sum(case when ${jobApplications.stage} in ('interview','final_interview') then 1 else 0 end)`,
      offers: sql<number>`sum(case when ${jobApplications.stage} = 'offer' then 1 else 0 end)`,
      followUpsDue: sql<number>`sum(case when ${jobApplications.followUpDate} is not null and ${jobApplications.followUpDate} >= ${now} and ${jobApplications.followUpDate} <= ${weekFromNow} then 1 else 0 end)`,
    })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));

  return {
    total: Number(row?.total ?? 0),
    interviews: Number(row?.interviews ?? 0),
    offers: Number(row?.offers ?? 0),
    followUpsDue: Number(row?.followUpsDue ?? 0),
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

export async function getPersonalNotes(): Promise<PersonalNoteRow[]> {
  const userId = await getUserId();

  return db
    .select()
    .from(personalNotes)
    .where(eq(personalNotes.userId, userId))
    .orderBy(desc(personalNotes.updatedAt));
}

