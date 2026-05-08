import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import InterviewReminderEmail from "../../emails/interview-reminder";
import FollowUpReminderEmail from "../../emails/follow-up-reminder";
import type { InterviewReminderEmailProps } from "../../emails/interview-reminder";
import type { FollowUpReminderEmailProps } from "../../emails/follow-up-reminder";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

type SendNotificationProps =
  | { type: "interview_reminder"; props: InterviewReminderEmailProps; to: string }
  | { type: "follow_up_reminder"; props: FollowUpReminderEmailProps; to: string };

/**
 * Send a notification email using Nodemailer.
 * Never throws — returns { success, error } so callers can handle failures per-item.
 */
export async function sendNotificationEmail({
  type,
  props,
  to,
}: SendNotificationProps): Promise<{ success: boolean; error?: string }> {
  try {
    const from = `"JobPace" <${process.env.EMAIL_SERVER_USER}>`;
    let subject = "";
    let html = "";

    if (type === "interview_reminder") {
      const typedProps = props as InterviewReminderEmailProps;
      subject = `Interview today: ${typedProps.position} at ${typedProps.companyName} 🗓️`;
      html = await render(InterviewReminderEmail(typedProps));
    } else {
      const typedProps = props as FollowUpReminderEmailProps;
      subject = `Follow-up reminder: ${typedProps.position} at ${typedProps.companyName}`;
      html = await render(FollowUpReminderEmail(typedProps));
    }

    await transporter.sendMail({ from, to, subject, html });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Failed to send ${type} to ${to}:`, message);
    return { success: false, error: message };
  }
}
