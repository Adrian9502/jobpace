"use server";

import { db } from "../db";
import { jobActivityLogs } from "../schema";

interface ChangeEntry {
  field: string;
  from: string | null;
  to: string | null;
}

export async function logActivity(
  userId: string,
  actionType: string,
  summary: string,
  applicationId?: string,
  changes: ChangeEntry[] = [],
) {
  try {
    const description = JSON.stringify({ summary, changes });
    await db.insert(jobActivityLogs).values({
      userId,
      actionType,
      description,
      applicationId: applicationId || null,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
