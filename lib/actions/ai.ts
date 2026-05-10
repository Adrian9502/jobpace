"use server";

import { db } from "../db";
import { aiChatMessages } from "../schema";
import { getUserId } from "../auth-helpers";
import { getMessageCount, clearChatHistory } from "../queries/ai";
import { asc, eq } from "drizzle-orm";

const MAX_MESSAGES = 200;

export async function saveChatMessage(
  role: string,
  content: string,
  action?: string | null
): Promise<{ success: boolean }> {
  try {
    const userId = await getUserId();

    // Enforce 200-message cap: delete oldest if at limit
    const count = await getMessageCount(userId);
    if (count >= MAX_MESSAGES) {
      const oldest = await db
        .select({ id: aiChatMessages.id })
        .from(aiChatMessages)
        .where(eq(aiChatMessages.userId, userId))
        .orderBy(asc(aiChatMessages.createdAt))
        .limit(1);

      if (oldest[0]) {
        await db
          .delete(aiChatMessages)
          .where(eq(aiChatMessages.id, oldest[0].id));
      }
    }

    await db.insert(aiChatMessages).values({
      userId,
      role,
      content,
      action: action ?? null,
    });

    return { success: true };
  } catch (err) {
    console.error("saveChatMessage error:", err);
    return { success: false };
  }
}

export async function deleteChatHistory(): Promise<{ success: boolean }> {
  try {
    const userId = await getUserId();
    await clearChatHistory(userId);
    return { success: true };
  } catch (err) {
    console.error("deleteChatHistory error:", err);
    return { success: false };
  }
}
