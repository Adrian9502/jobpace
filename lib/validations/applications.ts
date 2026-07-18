import { z } from "zod";
import { validateDateInBounds } from "../utils";

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100, "Company name is too long"),
  position: z.string().min(1, "Position is required").max(100, "Position is too long"),
  location: z.string().max(100, "Location is too long").nullable().optional(),
  workSetup: z.string().max(50).nullable().optional(),
  employmentType: z.string().max(50).nullable().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  stage: z.string().min(1, "Stage is required").max(50),
  status: z.string().max(50).nullable().optional(),
  source: z.string().max(100, "Source is too long").nullable().optional(),
  applicationLink: z.string().max(1000, "Link is too long").nullable().optional(),
  dateApplied: z.date({ message: "Date applied is required" }),
  followUpDate: z.date().nullable().optional(),
  interviewDate: z.date().nullable().optional(),
  contactName: z.string().max(100, "Name is too long").nullable().optional(),
  contactEmail: z.string().max(255, "Email is too long").nullable().optional(),
  jobDescription: z.string().max(10000, "Job description cannot exceed 10,000 characters").nullable().optional(),
  notes: z.string().max(10000, "Notes cannot exceed 10,000 characters").nullable().optional(),
  companyResearch: z.string().max(10000, "Company research cannot exceed 10,000 characters").nullable().optional(),
  linkedResumeUrl: z.string().max(2000, "Resume URL is too long").nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.dateApplied) {
    const dateError = validateDateInBounds(data.dateApplied, "Date applied");
    if (dateError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: dateError, path: ["dateApplied"] });
    }
  }

  if (data.followUpDate) {
    const followUpError = validateDateInBounds(data.followUpDate, "Follow-up date");
    if (followUpError) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: followUpError, path: ["followUpDate"] });
    }
  }
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
