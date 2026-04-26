// ──────────────────────────────────────────────
// Date formatting
// ──────────────────────────────────────────────

/** Format a date for display in tables / cards (e.g. "Apr 26, 2026"). */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format a date for activity log display (e.g. "Apr 26, 2026, 3:45 PM"). */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format just the time portion (e.g. "3:45 PM"). */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Convert a Date to a YYYY-MM-DD string for `<input type="date">`. */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

// ──────────────────────────────────────────────
// Money / Salary formatting
// ──────────────────────────────────────────────

/** Format a peso amount (e.g. "₱25,000"). */
export function formatMoney(amount: number | null | undefined): string {
  if (!amount) return "";
  return `₱${amount.toLocaleString()}`;
}

/** Format a salary range for display in tables (e.g. "₱25,000 – ₱35,000"). */
export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => "₱" + n.toLocaleString("en-PH");
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

/** Format a salary range in compact form for kanban cards (e.g. "₱25k-₱35k"). */
export function formatSalaryCompact(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => "₱" + (n / 1000).toFixed(0) + "k";
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

// ──────────────────────────────────────────────
// String helpers
// ──────────────────────────────────────────────

/** Capitalize the first letter of a string. */
export function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
