import { and, eq, isNotNull, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { jobApplications, notificationLogs, users } from "../schema";
import * as schema from "../schema";

type Database = NodePgDatabase<typeof schema>;

interface InterviewNotification {
  applicationId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  companyName: string;
  position: string;
  interviewDate: Date | null;
  contactName: string | null;
  location: string | null;
  workSetup: string | null;
}

interface FollowUpNotification {
  applicationId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  companyName: string;
  position: string;
  followUpDate: Date | null;
  contactName: string | null;
  contactEmail: string | null;
}

/**
 * Fetch today's interviews that haven't been notified yet.
 * JOINs with users table to get userEmail and userName for sending.
 * Date comparison uses AT TIME ZONE 'Asia/Manila' to match the cron fire time (12AM PHT / 4PM UTC).
 */
export async function getTodayInterviews(db: Database): Promise<InterviewNotification[]> {
  return await db
    .select({
      applicationId: jobApplications.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      companyName: jobApplications.companyName,
      position: jobApplications.position,
      interviewDate: jobApplications.interviewDate,
      contactName: jobApplications.contactName,
      location: jobApplications.location,
      workSetup: jobApplications.workSetup,
    })
    .from(jobApplications)
    .innerJoin(users, eq(jobApplications.userId, users.id))
    .where(
      and(
        isNotNull(jobApplications.interviewDate),
        sql`DATE(${jobApplications.interviewDate} AT TIME ZONE 'Asia/Manila') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date`,
        sql`NOT EXISTS (
          SELECT 1 FROM ${notificationLogs} nl 
          WHERE nl."applicationId" = ${jobApplications.id} 
          AND nl."notificationType" = 'interview_reminder' 
          AND DATE(nl."sentAt" AT TIME ZONE 'Asia/Manila') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date
        )`
      )
    );
}

/**
 * Fetch today's follow-ups that haven't been notified yet.
 * JOINs with users table to get userEmail and userName for sending.
 * Date comparison uses AT TIME ZONE 'Asia/Manila' to match the cron fire time (12AM PHT / 4PM UTC).
 */
export async function getTodayFollowUps(db: Database): Promise<FollowUpNotification[]> {
  return await db
    .select({
      applicationId: jobApplications.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      companyName: jobApplications.companyName,
      position: jobApplications.position,
      followUpDate: jobApplications.followUpDate,
      contactName: jobApplications.contactName,
      contactEmail: jobApplications.contactEmail,
    })
    .from(jobApplications)
    .innerJoin(users, eq(jobApplications.userId, users.id))
    .where(
      and(
        isNotNull(jobApplications.followUpDate),
        sql`DATE(${jobApplications.followUpDate} AT TIME ZONE 'Asia/Manila') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date`,
        sql`NOT EXISTS (
          SELECT 1 FROM ${notificationLogs} nl 
          WHERE nl."applicationId" = ${jobApplications.id} 
          AND nl."notificationType" = 'follow_up_reminder' 
          AND DATE(nl."sentAt" AT TIME ZONE 'Asia/Manila') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date
        )`
      )
    );
}

/**
 * Log a sent notification to prevent duplicate emails on re-runs.
 */
export async function logNotification(
  db: Database,
  {
    userId,
    applicationId,
    notificationType,
  }: {
    userId: string;
    applicationId: string;
    notificationType: "interview_reminder" | "follow_up_reminder";
  }
): Promise<void> {
  await db.insert(notificationLogs).values({
    userId,
    applicationId,
    notificationType,
  });
}
