import { z } from "zod";

// ──────────────────────────────────────────────
// Shared password rules
// ──────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number");

// ──────────────────────────────────────────────
// Sign Up
// ──────────────────────────────────────────────

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters")
      .trim(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    password: passwordSchema,
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

// ──────────────────────────────────────────────
// Sign In
// ──────────────────────────────────────────────

export const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

// ──────────────────────────────────────────────
// Forgot Password
// ──────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ──────────────────────────────────────────────
// Reset Password
// ──────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ──────────────────────────────────────────────
// Change / Set Password
// ──────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema,
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ──────────────────────────────────────────────
// Helper: extract field errors from Zod result
// ──────────────────────────────────────────────

export function extractFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}
