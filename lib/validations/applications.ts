import { z } from "zod";
import { validateDateInBounds } from "../utils";

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().nullable().optional(),
  workSetup: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  stage: z.string().min(1, "Stage is required"),
  status: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  applicationLink: z.string().nullable().optional(),
  dateApplied: z.date({ required_error: "Date applied is required" }),
  followUpDate: z.date().nullable().optional(),
  interviewDate: z.date().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  jobDescription: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  companyResearch: z.string().nullable().optional(),
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
