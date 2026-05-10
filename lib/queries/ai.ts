import { db } from "../db";
import {
  aiChatMessages,
  jobApplications,
  personalNotes,
  jobActivityLogs,
  userDocuments,
  notificationLogs,
} from "../schema";
import { eq, asc, desc, sql } from "drizzle-orm";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type AiChatMessageRow = typeof aiChatMessages.$inferSelect;
export type UserDocumentRow = typeof userDocuments.$inferSelect;
export type NotificationLogRow = typeof notificationLogs.$inferSelect;

// ──────────────────────────────────────────────
// Chat History Queries
// ──────────────────────────────────────────────

export async function getChatHistory(
  userId: string
): Promise<AiChatMessageRow[]> {
  return db
    .select()
    .from(aiChatMessages)
    .where(eq(aiChatMessages.userId, userId))
    .orderBy(asc(aiChatMessages.createdAt));
}

export async function clearChatHistory(userId: string): Promise<void> {
  await db.delete(aiChatMessages).where(eq(aiChatMessages.userId, userId));
}

export async function getMessageCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiChatMessages)
    .where(eq(aiChatMessages.userId, userId));

  return Number(row?.count ?? 0);
}

// ──────────────────────────────────────────────
// Context Queries (userId passed explicitly)
// ──────────────────────────────────────────────

export async function getApplicationsForAi(userId: string) {
  return db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId))
    .orderBy(desc(jobApplications.dateApplied));
}

export async function getPersonalNotesForAi(userId: string) {
  return db
    .select()
    .from(personalNotes)
    .where(eq(personalNotes.userId, userId))
    .orderBy(desc(personalNotes.createdAt));
}

export async function getRecentActivityLogs(userId: string, limit: number) {
  return db
    .select()
    .from(jobActivityLogs)
    .where(eq(jobActivityLogs.userId, userId))
    .orderBy(desc(jobActivityLogs.createdAt))
    .limit(limit);
}

export async function getUserDocumentsForAi(userId: string) {
  return db
    .select()
    .from(userDocuments)
    .where(eq(userDocuments.userId, userId));
}

export async function getNotificationLogsForAi(userId: string) {
  return db
    .select()
    .from(notificationLogs)
    .where(eq(notificationLogs.userId, userId));
}
