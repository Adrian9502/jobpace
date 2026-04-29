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
export function toDateInputValue(
  date: Date | string | null | undefined,
): string {
  if (!date) return "";

  if (typeof date === "string") {
    const datePrefix = date.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePrefix)) {
      return datePrefix;
    }
    return formatDateInputUTC(new Date(date));
  }

  return formatDateInputLocal(date);
}

function formatDateInputLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInputUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
export function formatSalaryCompact(
  min: number | null,
  max: number | null,
): string {
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

  // Max: same day 3 months from now (clamped)
  const nextMonths = now.getMonth() + 3;
  const nextYear = now.getFullYear();
  // Get last day of that month to clamp
  const lastDayOfFutureMonth = new Date(nextYear, nextMonths + 1, 0).getDate();
  const clampedDay = Math.min(now.getDate(), lastDayOfFutureMonth);
  const maxDate = new Date(nextYear, nextMonths, clampedDay);

  return {
    min: formatDateInputLocal(minDate),
    max: formatDateInputLocal(maxDate),
  };
}


/** Check if a date falls within the allowed bounds. Returns error string or null. */
export function validateDateInBounds(
  date: Date,
  fieldName: string,
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
// Misc helpers
// ──────────────────────────────────────────────

/** Get initials from a name (e.g. "John Doe" → "JD"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ──────────────────────────────────────────────
// String helpers
// ──────────────────────────────────────────────

/** Capitalize the first letter of a string. */
export function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
