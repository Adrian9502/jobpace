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
// Date validation
// ──────────────────────────────────────────────

/**
 * Returns min and max date strings (YYYY-MM-DD) for date inputs.
 * min = first day of last month
 * max = same day next month (clamped to end of month)
 */
export function getDateValidationBounds(): { min: string; max: string } {
  const now = new Date();

  // Min: first day of last month
  const minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Max: same day next month (clamped)
  const nextMonth = now.getMonth() + 1;
  const nextYear = now.getFullYear();
  // Get last day of next month to clamp
  const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  const clampedDay = Math.min(now.getDate(), lastDayOfNextMonth);
  const maxDate = new Date(nextYear, nextMonth, clampedDay);

  return {
    min: minDate.toISOString().split("T")[0],
    max: maxDate.toISOString().split("T")[0],
  };
}

/** Check if a date falls within the allowed bounds. Returns error string or null. */
export function validateDateInBounds(
  date: Date,
  fieldName: string
): string | null {
  const { min, max } = getDateValidationBounds();
  const minDate = new Date(min + "T00:00:00");
  const maxDate = new Date(max + "T23:59:59");

  if (date < minDate || date > maxDate) {
    return `${fieldName} must be between ${formatDate(minDate)} and ${formatDate(maxDate)}.`;
  }
  return null;
}

// ──────────────────────────────────────────────
// String helpers
// ──────────────────────────────────────────────

/** Capitalize the first letter of a string. */
export function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
