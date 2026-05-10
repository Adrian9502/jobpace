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
        sql`${jobApplications.stage} NOT IN ('hired', 'rejected', 'ghosted', 'withdrawn')`,
        sql`${users.notifyInterview} = true`,
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
        sql`${jobApplications.stage} NOT IN ('hired', 'rejected', 'ghosted', 'withdrawn')`,
        sql`${users.notifyFollowUp} = true`,
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
    notificationType: "interview_reminder" | "follow_up_reminder" | "stale_application_reminder";
  }
): Promise<void> {
  await db.insert(notificationLogs).values({
    userId,
    applicationId,
    notificationType,
  });
}

export interface StaleApplicationNotification {
  applicationId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  companyName: string;
  position: string;
  dateApplied: Date;
  updatedAt: Date | null;
}

/**
 * Fetch applications that have been in 'applied' or 'screening' for >= 20 days
 * and haven't been notified yet.
 */
export async function getStaleApplications(db: Database): Promise<StaleApplicationNotification[]> {
  return await db
    .select({
      applicationId: jobApplications.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      companyName: jobApplications.companyName,
      position: jobApplications.position,
      dateApplied: jobApplications.dateApplied,
      updatedAt: jobApplications.updatedAt,
    })
    .from(jobApplications)
    .innerJoin(users, eq(jobApplications.userId, users.id))
    .where(
      and(
        sql`${jobApplications.stage} IN ('applied', 'screening')`,
        sql`${jobApplications.updatedAt} <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila') - INTERVAL '20 days'`,
        sql`${users.notifyStale} = true`,
        sql`NOT EXISTS (
          SELECT 1 FROM ${notificationLogs} nl 
          WHERE nl."applicationId" = ${jobApplications.id} 
          AND nl."notificationType" = 'stale_application_reminder'
        )`
      )
    );
}

export interface UpcomingReminder {
  id: string;
  type: "interview" | "follow_up" | "stale";
  title: string;
  companyName: string;
  position: string;
  date: Date;
  applicationId: string;
  isActive: boolean;
}

export async function getUpcomingReminders(userId: string, db: Database): Promise<UpcomingReminder[]> {
  const apps = await db.query.jobApplications.findMany({
    where: eq(jobApplications.userId, userId),
  });

  const reminders: UpcomingReminder[] = [];
  const now = new Date();
  
  for (const app of apps) {
    if (["hired", "rejected", "ghosted", "withdrawn"].includes(app.stage)) continue;

    // Interview Reminder
    if (app.interviewDate && app.interviewDate >= now) {
      reminders.push({
        id: `int_${app.id}`,
        type: "interview",
        title: "Upcoming Interview",
        companyName: app.companyName,
        position: app.position,
        date: app.interviewDate,
        applicationId: app.id,
        isActive: app.interviewDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000,
      });
    }

    // Follow-up Reminder
    if (app.followUpDate) {
      const isPastDue = app.followUpDate < now;
      const isSoon = (app.followUpDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000); // within 7 days
      if (isPastDue || isSoon) {
        reminders.push({
          id: `fup_${app.id}`,
          type: "follow_up",
          title: isPastDue ? "Overdue Follow-up" : "Upcoming Follow-up",
          companyName: app.companyName,
          position: app.position,
          date: app.followUpDate,
          applicationId: app.id,
          isActive: isPastDue,
        });
      }
    }

    // Stale Application Reminder
    if (["applied", "screening"].includes(app.stage) && app.updatedAt) {
      const daysSinceUpdate = (now.getTime() - app.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate >= 20) {
        reminders.push({
          id: `stl_${app.id}`,
          type: "stale",
          title: "Stale Application",
          companyName: app.companyName,
          position: app.position,
          date: app.updatedAt, // Showing the date it was last updated
          applicationId: app.id,
          isActive: true,
        });
      }
    }
  }

  // Sort reminders: Interviews first (closest date), then follow-ups, then stale
  return reminders.sort((a, b) => {
    return a.date.getTime() - b.date.getTime();
  });
}

export interface NotificationHistoryItem {
  id: string;
  type: string;
  sentAt: Date | null;
  applicationId: string | null;
  companyName?: string;
  position?: string;
}

export async function getNotificationHistory(userId: string, db: Database): Promise<NotificationHistoryItem[]> {
  const logs = await db
    .select({
      id: notificationLogs.id,
      type: notificationLogs.notificationType,
      sentAt: notificationLogs.sentAt,
      applicationId: notificationLogs.applicationId,
      companyName: jobApplications.companyName,
      position: jobApplications.position,
    })
    .from(notificationLogs)
    .leftJoin(jobApplications, eq(notificationLogs.applicationId, jobApplications.id))
    .where(eq(notificationLogs.userId, userId))
    .orderBy(sql`${notificationLogs.sentAt} DESC`)
    .limit(50);

  return logs;
}
