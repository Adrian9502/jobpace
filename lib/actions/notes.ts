"use server";

import { db } from "../db";
import { personalNotes } from "../schema";
import { getUserId } from "../auth-helpers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import { noteSchema } from "../validations/notes";

export type ActionResult = {
  success: boolean;
  error?: string;
  changes?: string[];
};

async function getNoteById(userId: string, noteId: string) {
  const rows = await db
    .select()
    .from(personalNotes)
    .where(and(eq(personalNotes.id, noteId), eq(personalNotes.userId, userId)))
    .limit(1);

  return rows[0];
}

export async function createNote(
  title: string,
  content: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    
    // Zod Validation
    const parsed = noteSchema.safeParse({ title, content });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const [newNote] = await db
      .insert(personalNotes)
      .values({
        userId,
        title: parsed.data.title,
        content: parsed.data.content,
      })
      .returning();

    const changes = [];
    if (newNote?.title) {
      changes.push({ field: "Title", from: null, to: newNote.title });
    }
    if (newNote?.content) {
      changes.push({ field: "Content", from: null, to: "(provided)" });
    }

    await logActivity(
      userId,
      "CREATE",
      `Created note: ${newNote?.title || "Untitled"}`,
      undefined,
      changes,
    );
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("createNote error:", err);
    return { success: false, error: "Failed to create note." };
  }
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await getNoteById(userId, id);

    if (!existing) {
      return { success: false, error: "Note not found." };
    }

    // Zod Validation
    const parsed = noteSchema.safeParse({ title, content });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await db
      .update(personalNotes)
      .set({ title: parsed.data.title, content: parsed.data.content, updatedAt: new Date() })
      .where(and(eq(personalNotes.id, id), eq(personalNotes.userId, userId)));

    const changes = [];
    if (existing.title !== parsed.data.title) {
      changes.push({
        field: "Title",
        from: existing.title || "Untitled",
        to: parsed.data.title || "Untitled",
      });
    }

    const oldContent = existing.content ? "(provided)" : "None";
    const newContent = parsed.data.content ? "(provided)" : "None";
    if (oldContent !== newContent) {
      changes.push({ field: "Content", from: oldContent, to: newContent });
    }

    if (changes.length > 0) {
      await logActivity(
        userId,
        "UPDATE",
        `Updated note: ${parsed.data.title || existing.title || "Untitled"}`,
        undefined,
        changes,
      );
    }
    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("updateNote error:", err);
    return { success: false, error: "Failed to update note." };
  }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    const existing = await getNoteById(userId, id);

    if (!existing) {
      return { success: false, error: "Note not found." };
    }

    await db
      .delete(personalNotes)
      .where(and(eq(personalNotes.id, id), eq(personalNotes.userId, userId)));

    await logActivity(
      userId,
      "DELETE",
      `Deleted note: ${existing.title || "Untitled"}`,
      undefined,
      [{ field: "Note", from: existing.title || "Untitled", to: null }],
    );

    revalidatePath("/dashboard/notes");
    revalidatePath("/dashboard/activity");
    return { success: true };
  } catch (err) {
    console.error("deleteNote error:", err);
    return { success: false, error: "Failed to delete note." };
  }
}
