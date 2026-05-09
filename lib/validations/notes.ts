import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  content: z.string().max(10000, "Content cannot exceed 10,000 characters").optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;
