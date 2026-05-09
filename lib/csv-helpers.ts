import type { ApplicationRow } from "./queries";

// ──────────────────────────────────────────────
// Export helpers
// ──────────────────────────────────────────────

const CSV_HEADERS = [
  "Company Name",
  "Position",
  "Location",
  "Work Setup",
  "Employment Type",
  "Salary Min",
  "Salary Max",
  "Stage",
  "Status",
  "Source",
  "Application Link",
  "Date Applied",
  "Follow-up Date",
  "Interview Date",
  "Contact Name",
  "Contact Email",
  "Job Description",
  "Notes",
  "Company Research",
] as const;

function formatDateForCsv(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
}

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function applicationsToCsv(applications: ApplicationRow[]): string {
  const headerRow = CSV_HEADERS.map(escapeCsvField).join(",");

  const dataRows = applications.map((app) =>
    [
      app.companyName,
      app.position,
      app.location,
      app.workSetup,
      app.employmentType,
      app.salaryMin != null ? String(app.salaryMin) : "",
      app.salaryMax != null ? String(app.salaryMax) : "",
      app.stage,
      app.status,
      app.source,
      app.applicationLink,
      formatDateForCsv(app.dateApplied),
      formatDateForCsv(app.followUpDate),
      formatDateForCsv(app.interviewDate),
      app.contactName,
      app.contactEmail,
      app.jobDescription,
      app.notes,
      app.companyResearch,
    ]
      .map(escapeCsvField)
      .join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}

export function generateCsvTemplate(): string {
  return CSV_HEADERS.join(",") + "\n" + [
    "Acme Corp",
    "Software Engineer",
    "Makati",
    "hybrid",
    "full-time",
    "25000",
    "35000",
    "applied",
    "pending",
    "LinkedIn",
    "https://example.com/job",
    "2025-01-15",
    "2025-01-22",
    "",
    "Juan Dela Cruz",
    "juan@acme.com",
    "",
    "",
    "",
  ]
    .map(escapeCsvField)
    .join(",");
}

// ──────────────────────────────────────────────
// Import helpers
// ──────────────────────────────────────────────

// Maps friendly CSV header names to our database field names
const HEADER_MAP: Record<string, string> = {
  "company name": "companyName",
  "position": "position",
  "location": "location",
  "work setup": "workSetup",
  "employment type": "employmentType",
  "salary min": "salaryMin",
  "salary max": "salaryMax",
  "stage": "stage",
  "status": "status",
  "source": "source",
  "application link": "applicationLink",
  "date applied": "dateApplied",
  "follow-up date": "followUpDate",
  "interview date": "interviewDate",
  "contact name": "contactName",
  "contact email": "contactEmail",
  "job description": "jobDescription",
  "notes": "notes",
  "company research": "companyResearch",
};

export interface ParsedRow {
  companyName: string;
  position: string;
  location: string | null;
  workSetup: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  stage: string;
  status: string | null;
  source: string | null;
  applicationLink: string | null;
  dateApplied: Date;
  followUpDate: Date | null;
  interviewDate: Date | null;
  contactName: string | null;
  contactEmail: string | null;
  jobDescription: string | null;
  notes: string | null;
  companyResearch: string | null;
}

export interface ImportValidationResult {
  validRows: ParsedRow[];
  errors: { row: number; message: string }[];
}

function parseDateField(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const d = new Date(value.trim());
  if (isNaN(d.getTime())) return null;
  return d;
}

function toNullableString(val: string | null | undefined): string | null {
  if (val == null || val.trim() === "") return null;
  return val.trim();
}

const VALID_STAGES = [
  "applied", "screening", "interview", "assessment",
  "final_interview", "offer", "hired", "rejected", "ghosted", "withdrawn",
];

const VALID_STATUSES = ["pending", "ongoing", "passed", "failed"];

/**
 * Validates and transforms raw parsed CSV rows into typed application data.
 * Each row is independently validated — bad rows are collected as errors.
 */
export function validateCsvRows(
  rawRows: Record<string, string>[],
  headers: string[]
): ImportValidationResult {
  // Build a mapping from raw headers to db field names
  const headerMapping: Record<number, string> = {};
  headers.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    if (HEADER_MAP[key]) {
      headerMapping[i] = HEADER_MAP[key];
    }
  });

  const validRows: ParsedRow[] = [];
  const errors: { row: number; message: string }[] = [];

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2; // 1-indexed + header row

    // Map raw values using header mapping
    const mapped: Record<string, string> = {};
    Object.entries(raw).forEach(([key, val]) => {
      const normalizedKey = key.trim().toLowerCase();
      const dbField = HEADER_MAP[normalizedKey];
      if (dbField) {
        mapped[dbField] = val;
      }
    });

    // Required fields
    const companyName = mapped.companyName?.trim();
    const position = mapped.position?.trim();
    const dateAppliedStr = mapped.dateApplied?.trim();

    if (!companyName) {
      errors.push({ row: rowNum, message: "Missing required field: Company Name" });
      return;
    }
    if (!position) {
      errors.push({ row: rowNum, message: "Missing required field: Position" });
      return;
    }
    if (!dateAppliedStr) {
      errors.push({ row: rowNum, message: "Missing required field: Date Applied" });
      return;
    }

    const dateApplied = parseDateField(dateAppliedStr);
    if (!dateApplied) {
      errors.push({ row: rowNum, message: `Invalid Date Applied: "${dateAppliedStr}"` });
      return;
    }

    // Validate stage if provided (case-insensitive)
    const stageRaw = toNullableString(mapped.stage);
    const stage = stageRaw ? stageRaw.toLowerCase().replace(/\s+/g, "_") : "applied";
    if (!VALID_STAGES.includes(stage)) {
      errors.push({ row: rowNum, message: `Invalid stage: "${stageRaw}"` });
      return;
    }

    // Validate status if provided (case-insensitive)
    const statusRaw = toNullableString(mapped.status);
    const status = statusRaw ? statusRaw.toLowerCase() : null;
    if (status && !VALID_STATUSES.includes(status)) {
      errors.push({ row: rowNum, message: `Invalid status: "${statusRaw}"` });
      return;
    }

    // Parse salary fields
    const salaryMin = mapped.salaryMin ? parseInt(mapped.salaryMin, 10) : null;
    const salaryMax = mapped.salaryMax ? parseInt(mapped.salaryMax, 10) : null;
    if (mapped.salaryMin && (salaryMin === null || isNaN(salaryMin))) {
      errors.push({ row: rowNum, message: `Invalid Salary Min: "${mapped.salaryMin}"` });
      return;
    }
    if (mapped.salaryMax && (salaryMax === null || isNaN(salaryMax))) {
      errors.push({ row: rowNum, message: `Invalid Salary Max: "${mapped.salaryMax}"` });
      return;
    }

    // String length validation
    if (companyName.length > 100) {
      errors.push({ row: rowNum, message: "Company Name exceeds 100 characters" });
      return;
    }
    if (position.length > 100) {
      errors.push({ row: rowNum, message: "Position exceeds 100 characters" });
      return;
    }

    validRows.push({
      companyName,
      position,
      location: toNullableString(mapped.location),
      workSetup: toNullableString(mapped.workSetup),
      employmentType: toNullableString(mapped.employmentType),
      salaryMin: salaryMin && !isNaN(salaryMin) ? salaryMin : null,
      salaryMax: salaryMax && !isNaN(salaryMax) ? salaryMax : null,
      stage,
      status: status || "pending",
      source: toNullableString(mapped.source),
      applicationLink: toNullableString(mapped.applicationLink),
      dateApplied,
      followUpDate: parseDateField(mapped.followUpDate),
      interviewDate: parseDateField(mapped.interviewDate),
      contactName: toNullableString(mapped.contactName),
      contactEmail: toNullableString(mapped.contactEmail),
      jobDescription: toNullableString(mapped.jobDescription),
      notes: toNullableString(mapped.notes),
      companyResearch: toNullableString(mapped.companyResearch),
    });
  });

  return { validRows, errors };
}
