import { pgTable, text, timestamp, bigint, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: bigint("expires_at", { mode: "number" }),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

// YOUR APP TABLES GO BELOW HERE 👇
export const jobApplications = pgTable("job_applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),

  // Basic Info
  companyName: text("companyName").notNull(),
  position: text("position").notNull(),
  location: text("location"),                  // e.g. Makati, BGC, Cebu, Remote
  workSetup: text("workSetup"),                // onsite | hybrid | remote
  employmentType: text("employmentType"),      // full-time | part-time | contractual | project-based | OJT/internship

  // Salary (PH uses monthly, not yearly)
  salaryMin: integer("salaryMin"),             // e.g. 25000
  salaryMax: integer("salaryMax"),             // e.g. 35000

  // Tracking
  status: text("status").notNull().default("applied"), // applied | interview | exam | offer | hired | rejected | ghosted
  source: text("source"),                      // Jobstreet | LinkedIn | Kalibrr | Indeed | Referral | Company Website | Facebook | Walk-in
  applicationLink: text("applicationLink"),
  dateApplied: timestamp("dateApplied", { withTimezone: true }).notNull(),
  followUpDate: timestamp("followUpDate", { withTimezone: true }),

  // Details
  jobDescription: text("jobDescription"),
  notes: text("notes"),

  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const jobActivityLogs = pgTable("job_activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  applicationId: text("applicationId"), // optional, e.g. when logging a general event or if the application was deleted
  actionType: text("actionType").notNull(), // CREATE, UPDATE, STATUS_CHANGE, DELETE
  description: text("description").notNull(), // User-friendly description of what happened
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});