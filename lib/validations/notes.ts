import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;
