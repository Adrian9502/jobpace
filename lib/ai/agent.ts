import { db } from "@/lib/db";
import { jobApplications, jobActivityLogs } from "@/lib/schema";
import { eq, and, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
  multipleMatches?: string[];
};

/**
 * Find applications by fuzzy company name, scoped to the user.
 * Returns the matching rows or an error result if 0 or 2+ matches found.
 */
async function findApplication(
  userId: string,
  companyName: string
): Promise<
  | { found: true; apps: (typeof jobApplications.$inferSelect)[] }
  | { found: false; result: ToolResult }
> {
  const matches = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.userId, userId),
        ilike(jobApplications.companyName, `%${companyName}%`)
      )
    );

  if (matches.length === 0) {
    return {
      found: false,
      result: {
        success: false,
        error: `No application found matching "${companyName}". Check the company name and try again.`,
      },
    };
  }

  if (matches.length > 1) {
    return {
      found: false,
      result: {
        success: false,
        error: `Multiple applications match "${companyName}". Please specify which one.`,
        multipleMatches: matches.map(
          (m) => `${m.companyName} — ${m.position}`
        ),
      },
    };
  }

  return { found: true, apps: matches };
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/applications");
}

async function logActivity(
  userId: string,
  applicationId: string | null,
  description: string
) {
  await db.insert(jobActivityLogs).values({
    userId,
    applicationId,
    actionType: "AI_ACTION",
    description,
  });
}

// ──────────────────────────────────────────────
// Tool Executors
// ──────────────────────────────────────────────

async function getApplications(userId: string): Promise<ToolResult> {
  const apps = await db
    .select({
      id: jobApplications.id,
      companyName: jobApplications.companyName,
      position: jobApplications.position,
      location: jobApplications.location,
      workSetup: jobApplications.workSetup,
      employmentType: jobApplications.employmentType,
      salaryMin: jobApplications.salaryMin,
      salaryMax: jobApplications.salaryMax,
      stage: jobApplications.stage,
      status: jobApplications.status,
      source: jobApplications.source,
      dateApplied: jobApplications.dateApplied,
      followUpDate: jobApplications.followUpDate,
      interviewDate: jobApplications.interviewDate,
      contactName: jobApplications.contactName,
      contactEmail: jobApplications.contactEmail,
    })
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));

  return { success: true, data: apps };
}

async function updateStage(
  userId: string,
  args: { companyName: string; stage: string }
): Promise<ToolResult> {
  const lookup = await findApplication(userId, args.companyName);
  if (lookup.found === false) return lookup.result;

  const app = lookup.apps[0];

  await db
    .update(jobApplications)
    .set({ stage: args.stage, updatedAt: new Date() })
    .where(
      and(eq(jobApplications.id, app.id), eq(jobApplications.userId, userId))
    );

  await logActivity(
    userId,
    app.id,
    `AI moved "${app.companyName} — ${app.position}" to stage "${args.stage}"`
  );

  revalidateDashboard();

  return {
    success: true,
    data: {
      companyName: app.companyName,
      position: app.position,
      previousStage: app.stage,
      newStage: args.stage,
    },
  };
}

async function updateStatus(
  userId: string,
  args: { companyName: string; status: string }
): Promise<ToolResult> {
  const lookup = await findApplication(userId, args.companyName);
  if (lookup.found === false) return lookup.result;

  const app = lookup.apps[0];

  await db
    .update(jobApplications)
    .set({ status: args.status, updatedAt: new Date() })
    .where(
      and(eq(jobApplications.id, app.id), eq(jobApplications.userId, userId))
    );

  await logActivity(
    userId,
    app.id,
    `AI updated status of "${app.companyName} — ${app.position}" to "${args.status}"`
  );

  revalidateDashboard();

  return {
    success: true,
    data: {
      companyName: app.companyName,
      position: app.position,
      previousStatus: app.status,
      newStatus: args.status,
    },
  };
}

async function addApplication(
  userId: string,
  args: {
    companyName: string;
    position: string;
    stage?: string;
    source?: string;
    location?: string;
    workSetup?: string;
    dateApplied?: string;
  }
): Promise<ToolResult> {
  const dateApplied = args.dateApplied ? new Date(args.dateApplied) : new Date();
  const stage = args.stage || "applied";

  const [inserted] = await db
    .insert(jobApplications)
    .values({
      userId,
      companyName: args.companyName,
      position: args.position,
      stage,
      source: args.source || null,
      location: args.location || null,
      workSetup: args.workSetup || null,
      dateApplied,
    })
    .returning({ id: jobApplications.id });

  await logActivity(
    userId,
    inserted.id,
    `AI added new application: "${args.companyName} — ${args.position}"`
  );

  revalidateDashboard();

  return {
    success: true,
    data: {
      id: inserted.id,
      companyName: args.companyName,
      position: args.position,
      stage,
      dateApplied: dateApplied.toISOString(),
    },
  };
}

async function deleteApplication(
  userId: string,
  args: { companyName: string; confirmed: boolean }
): Promise<ToolResult> {
  if (!args.confirmed) {
    return {
      success: false,
      error:
        "Deletion not confirmed. Please ask the user to confirm before calling this tool.",
    };
  }

  const lookup = await findApplication(userId, args.companyName);
  if (lookup.found === false) return lookup.result;

  const app = lookup.apps[0];

  await db
    .delete(jobApplications)
    .where(
      and(eq(jobApplications.id, app.id), eq(jobApplications.userId, userId))
    );

  await logActivity(
    userId,
    null,
    `AI deleted application: "${app.companyName} — ${app.position}"`
  );

  revalidateDashboard();

  return {
    success: true,
    data: {
      companyName: app.companyName,
      position: app.position,
    },
  };
}

// ──────────────────────────────────────────────
// Main dispatcher
// ──────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<ToolResult> {
  switch (toolName) {
    case "get_applications":
      return getApplications(userId);
    case "update_stage":
      return updateStage(
        userId,
        args as { companyName: string; stage: string }
      );
    case "update_status":
      return updateStatus(
        userId,
        args as { companyName: string; status: string }
      );
    case "add_application":
      return addApplication(
        userId,
        args as {
          companyName: string;
          position: string;
          stage?: string;
          source?: string;
          location?: string;
          workSetup?: string;
          dateApplied?: string;
        }
      );
    case "delete_application":
      return deleteApplication(
        userId,
        args as { companyName: string; confirmed: boolean }
      );
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
