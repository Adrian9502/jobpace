import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getTodayInterviews,
  getTodayFollowUps,
  getStaleApplications,
  logNotification,
} from "@/lib/queries/notifications";
import { sendNotificationEmail } from "@/lib/email/send-notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [interviews, followUps, staleApps] = await Promise.all([
      getTodayInterviews(db),
      getTodayFollowUps(db),
      getStaleApplications(db),
    ]);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobpace.app";

    // Process interview reminders
    for (const interview of interviews) {
      try {
        const result = await sendNotificationEmail({
          type: "interview_reminder",
          to: interview.userEmail,
          props: {
            userName: interview.userName || "Job Seeker",
            companyName: interview.companyName,
            position: interview.position,
            interviewDate: interview.interviewDate!,
            location: interview.location || undefined,
            workSetup: interview.workSetup || undefined,
            contactName: interview.contactName || undefined,
            appUrl,
          },
        });

        if (result.success) {
          await logNotification(db, {
            userId: interview.userId,
            applicationId: interview.applicationId,
            notificationType: "interview_reminder",
          });
          sent++;
        } else {
          failed++;
          errors.push(
            `interview_reminder [${interview.applicationId}]: ${result.error}`
          );
        }
      } catch (error: unknown) {
        failed++;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `interview_reminder [${interview.applicationId}]:`,
          message
        );
        errors.push(
          `interview_reminder [${interview.applicationId}]: ${message}`
        );
      }
    }

    // Process follow-up reminders
    for (const followUp of followUps) {
      try {
        const result = await sendNotificationEmail({
          type: "follow_up_reminder",
          to: followUp.userEmail,
          props: {
            userName: followUp.userName || "Job Seeker",
            companyName: followUp.companyName,
            position: followUp.position,
            followUpDate: followUp.followUpDate!,
            contactName: followUp.contactName || undefined,
            contactEmail: followUp.contactEmail || undefined,
            appUrl,
          },
        });

        if (result.success) {
          await logNotification(db, {
            userId: followUp.userId,
            applicationId: followUp.applicationId,
            notificationType: "follow_up_reminder",
          });
          sent++;
        } else {
          failed++;
          errors.push(
            `follow_up_reminder [${followUp.applicationId}]: ${result.error}`
          );
        }
      } catch (error: unknown) {
        failed++;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `follow_up_reminder [${followUp.applicationId}]:`,
          message
        );
        errors.push(
          `follow_up_reminder [${followUp.applicationId}]: ${message}`
        );
      }
    }

    // Process stale application reminders
    for (const stale of staleApps) {
      try {
        const result = await sendNotificationEmail({
          type: "stale_application_reminder",
          to: stale.userEmail,
          props: {
            userName: stale.userName || "Job Seeker",
            companyName: stale.companyName,
            position: stale.position,
            dateApplied: stale.dateApplied,
            updatedAt: stale.updatedAt,
            appUrl,
          },
        });

        if (result.success) {
          await logNotification(db, {
            userId: stale.userId,
            applicationId: stale.applicationId,
            notificationType: "stale_application_reminder",
          });
          sent++;
        } else {
          failed++;
          errors.push(
            `stale_application_reminder [${stale.applicationId}]: ${result.error}`
          );
        }
      } catch (error: unknown) {
        failed++;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `stale_application_reminder [${stale.applicationId}]:`,
          message
        );
        errors.push(
          `stale_application_reminder [${stale.applicationId}]: ${message}`
        );
      }
    }

    return NextResponse.json({ success: true, sent, failed, errors });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron email-notifications error:", message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
