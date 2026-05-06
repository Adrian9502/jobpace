"use server";

import { db } from "@/lib/db";
import {
  users,
  verificationTokens,
  passwordResetTokens,
  sessions,
} from "@/lib/schema";
import { eq, and, lt } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { signIn } from "@/lib/auth";
import { getUserId, getSession } from "@/lib/auth-helpers";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "@/lib/email";
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  extractFieldErrors,
} from "@/lib/validations/auth";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type AuthActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// ──────────────────────────────────────────────
// Rate Limiting (in-memory, per-process)
// ──────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 5; // max 5 requests per window

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

async function generateToken(): Promise<string> {
  return crypto.randomUUID();
}

async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return rows[0] ?? null;
}

// ──────────────────────────────────────────────
// SIGN UP
// ──────────────────────────────────────────────

export async function signUpWithCredentials(
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Rate limit by email
    if (!checkRateLimit(`signup:${raw.email?.toLowerCase()}`)) {
      return {
        success: false,
        error: "Too many requests. Please try again in a minute.",
      };
    }

    // Validate
    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: extractFieldErrors(parsed.error),
      };
    }

    const { firstName, lastName, email, password } = parsed.data;
    const name = `${firstName} ${lastName}`.trim();

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        fieldErrors: { email: ["An account with this email already exists"] },
      };
    }

    // Hash password and create user
    const hashedPassword = await hash(password, SALT_ROUNDS);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null,
      })
      .returning({ id: users.id, email: users.email });

    // Generate verification token and send email
    const token = await generateToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await db.insert(verificationTokens).values({
      identifier: newUser.email,
      token,
      expires,
    });

    await sendVerificationEmail(newUser.email, token);

    return { success: true };
  } catch (error) {
    console.error("signUpWithCredentials error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ──────────────────────────────────────────────
// SIGN IN
// ──────────────────────────────────────────────

export async function signInWithCredentials(
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Rate limit by email
    if (!checkRateLimit(`signin:${raw.email?.toLowerCase()}`)) {
      return {
        success: false,
        error: "Too many requests. Please try again in a minute.",
      };
    }

    // Validate
    const parsed = signInSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: extractFieldErrors(parsed.error),
      };
    }

    // Check if user needs email verification before attempting sign in
    const user = await findUserByEmail(parsed.data.email);
    if (user && user.password && !user.emailVerified) {
      return {
        success: false,
        error: "EMAIL_NOT_VERIFIED",
      };
    }

    // Attempt sign in via Auth.js Credentials provider
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password.",
          };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }

    // Auth.js throws a NEXT_REDIRECT "error" on successful redirect — rethrow it
    throw error;
  }
}

// ──────────────────────────────────────────────
// RESEND VERIFICATION EMAIL
// ──────────────────────────────────────────────

export async function resendVerificationEmail(
  email: string,
): Promise<AuthActionResult> {
  try {
    if (!checkRateLimit(`resend:${email.toLowerCase()}`)) {
      return {
        success: false,
        error: "Too many requests. Please try again in a minute.",
      };
    }

    const user = await findUserByEmail(email);

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return { success: true };
    }

    // Delete existing tokens for this email
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email.toLowerCase()));

    // Generate new token
    const token = await generateToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await db.insert(verificationTokens).values({
      identifier: email.toLowerCase(),
      token,
      expires,
    });

    await sendVerificationEmail(email.toLowerCase(), token);

    return { success: true };
  } catch (error) {
    console.error("resendVerificationEmail error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ──────────────────────────────────────────────
// FORGOT PASSWORD (send reset email)
// ──────────────────────────────────────────────

export async function forgotPassword(
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const raw = { email: formData.get("email") as string };

    if (!checkRateLimit(`forgot:${raw.email?.toLowerCase()}`)) {
      return {
        success: false,
        error: "Too many requests. Please try again in a minute.",
      };
    }

    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: extractFieldErrors(parsed.error),
      };
    }

    const { email } = parsed.data;
    const user = await findUserByEmail(email);

    // Always return success to prevent email enumeration
    if (user) {
      // Delete any existing reset tokens for this user
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      const token = await generateToken();
      const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expires,
      });

      await sendPasswordResetEmail(email, token);
    }

    return { success: true };
  } catch (error) {
    console.error("forgotPassword error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ──────────────────────────────────────────────
// RESET PASSWORD
// ──────────────────────────────────────────────

export async function resetPassword(
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const raw = {
      token: formData.get("token") as string,
      password: formData.get("password") as string,
    };

    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: extractFieldErrors(parsed.error),
      };
    }

    const { token, password } = parsed.data;

    // Find the token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken) {
      return {
        success: false,
        error: "Invalid or expired reset link. Please request a new one.",
      };
    }

    // Check if expired
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Hash new password and update user
    const hashedPassword = await hash(password, SALT_ROUNDS);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        emailVerified: new Date(), // Also verify email since they proved ownership
      })
      .where(eq(users.id, resetToken.userId));

    // Invalidate all existing sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, resetToken.userId));

    // Send password changed notification
    try {
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, resetToken.userId))
        .limit(1);

      if (updatedUser?.email) {
        const headersList = await headers();
        const ip =
          headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headersList.get("x-real-ip") ||
          "Unknown";

        const now = new Date();
        const date = now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const time = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        });

        await sendPasswordChangedEmail(
          updatedUser.email,
          updatedUser.name ?? "User",
          ip,
          time,
          date,
        );
      }
    } catch {
      // Don't block response if email fails
    }

    return { success: true };
  } catch (error) {
    console.error("resetPassword error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ──────────────────────────────────────────────
// CHANGE / SET PASSWORD
// ──────────────────────────────────────────────

export async function changePassword(
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const userId = await getUserId();
    const session = await getSession();

    if (!session?.user?.email) {
      return { success: false, error: "You must be signed in." };
    }

    const raw = {
      currentPassword: (formData.get("currentPassword") as string) || undefined,
      newPassword: formData.get("newPassword") as string,
    };

    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: extractFieldErrors(parsed.error),
      };
    }

    // Get full user record to check if they have a password
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // If user has a password, verify current password
    if (user.password) {
      if (!parsed.data.currentPassword) {
        return {
          success: false,
          fieldErrors: { currentPassword: ["Current password is required"] },
        };
      }

      const isValid = await compare(parsed.data.currentPassword, user.password);
      if (!isValid) {
        return {
          success: false,
          fieldErrors: { currentPassword: ["Current password is incorrect"] },
        };
      }
    }

    // Hash and update
    const hashedPassword = await hash(parsed.data.newPassword, SALT_ROUNDS);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    // Send password changed notification
    try {
      const headersList = await headers();
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "Unknown";

      const now = new Date();
      const date = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });

      await sendPasswordChangedEmail(
        user.email!,
        user.name ?? "User",
        ip,
        time,
        date,
      );
    } catch {
      // Don't block response if email fails
    }

    return { success: true };
  } catch (error) {
    console.error("changePassword error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
