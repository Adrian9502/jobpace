import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { VerificationEmail } from "@/emails/VerificationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { PasswordChangedEmail } from "@/emails/PasswordChangedEmail";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const html = await render(VerificationEmail({ verificationUrl }));

  try {
    await transporter.sendMail({
      from: `"JobPace" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Verify your JobPace account",
      html,
    });
  } catch (error) {
    console.error("Nodemailer verification email error:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  
  const html = await render(PasswordResetEmail({ resetUrl }));

  try {
    await transporter.sendMail({
      from: `"JobPace" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Reset your JobPace password",
      html,
    });
  } catch (error) {
    console.error("Nodemailer password reset email error:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<void> {
  const html = await render(WelcomeEmail({ name }));

  try {
    await transporter.sendMail({
      from: `"JobPace" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Welcome to JobPace!",
      html,
    });
  } catch (error) {
    console.error("Nodemailer welcome email error:", error);
    // Don't throw here to avoid blocking sign-in if welcome email fails
  }
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string,
  ipAddress: string,
  time: string,
  date: string,
): Promise<void> {
  const html = await render(PasswordChangedEmail({ name, ipAddress, time, date }));

  try {
    await transporter.sendMail({
      from: `"JobPace Security" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Security Alert: Your password was changed",
      html,
    });
  } catch (error) {
    console.error("Nodemailer password changed email error:", error);
  }
}

export async function sendFeedbackEmail(
  userEmail: string,
  userName: string,
  category: string,
  description: string,
): Promise<void> {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Feedback Received</h2>
      <p><strong>From:</strong> ${userName} (${userEmail})</p>
      <p><strong>Category:</strong> ${category}</p>
      <hr />
      <h3>Description:</h3>
      <p style="white-space: pre-wrap;">${description}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"JobPace Feedback" <${process.env.EMAIL_SERVER_USER}>`,
      to: "bontojohnadrian@gmail.com",
      subject: `[JobPace] New ${category} from ${userName}`,
      html,
    });
  } catch (error) {
    console.error("Nodemailer feedback email error:", error);
    throw new Error("Failed to send feedback email");
  }
}
