"use server";

import { db } from "@/lib/db";
import { userDocuments } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getUserId } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function getUserDocuments() {
  try {
    const userId = await getUserId();

    const docs = await db
      .select()
      .from(userDocuments)
      .where(eq(userDocuments.userId, userId))
      .orderBy(userDocuments.createdAt);

    return docs;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function addDocument(data: { type: string; url: string; name: string }) {
  try {
    const userId = await getUserId();

    await db.insert(userDocuments).values({
      userId,
      type: data.type,
      url: data.url,
      name: data.name,
    });

    revalidatePath("/dashboard/resume-and-documents");
    return { success: true };
  } catch (error) {
    console.error("Error adding document:", error);
    return { success: false, error: "Failed to add document" };
  }
}

export async function deleteDocument(id: string) {
  try {
    const userId = await getUserId();

    // Verify ownership before deleting
    const doc = await db.query.userDocuments.findFirst({
      where: and(
        eq(userDocuments.id, id),
        eq(userDocuments.userId, userId)
      ),
    });

    if (!doc) {
      throw new Error("Document not found or unauthorized");
    }

    await db.delete(userDocuments).where(eq(userDocuments.id, id));

    revalidatePath("/dashboard/resume-and-documents");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}
