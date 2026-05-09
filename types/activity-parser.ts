import type { ParsedLog } from "@/types/activity";

export function parseLog(description: string): ParsedLog {
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed.summary === "string") {
      return {
        summary: parsed.summary,
        changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      };
    }
  } catch {}

  const changeMatch = description.match(
    /^(.+?)\s+changed from\s+(.+?)\s+to\s+(.+)$/i,
  );
  if (changeMatch) {
    return {
      summary: description,
      changes: [
        {
          field: changeMatch[1].trim(),
          from: changeMatch[2].trim(),
          to: changeMatch[3].trim(),
        },
      ],
    };
  }

  const setMatch = description.match(/^(.+?)\s+set to\s+(.+)$/i);
  if (setMatch) {
    return {
      summary: description,
      changes: [
        { field: setMatch[1].trim(), from: null, to: setMatch[2].trim() },
      ],
    };
  }

  const deleteMatch = description.match(/^Deleted application for\s+(.+)$/i);
  if (deleteMatch) {
    return {
      summary: description,
      changes: [
        { field: "Application", from: deleteMatch[1].trim(), to: null },
      ],
    };
  }

  return { summary: description, changes: [] };
}
