"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { userFeedbacks, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sendFeedbackEmail } from "@/lib/email";

const feedbackSchema = z.object({
  category: z.enum(["Bug", "Feature Request", "General"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
});

export async function submitFeedback(data: z.infer<typeof feedbackSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = feedbackSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.issues[0].message };
    }

    const { category, description } = validatedData.data;
    const userId = session.user.id;

    // Get user details
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = userResult[0];

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Insert to database
    await db.insert(userFeedbacks).values({
      userId,
      category,
      description,
    });

    // Send email to admin
    await sendFeedbackEmail(
      user.email,
      user.name || user.username || "User",
      category,
      description,
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
