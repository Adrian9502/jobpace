import "dotenv/config";
import { db } from "../lib/db";
import { jobApplications } from "../lib/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting database migration for stage/status...");

  // Mapping existing data:
  // Assuming the old `status` column data is currently in the `stage` column after `db:push` 
  // (if Drizzle prompted to rename `status` to `stage`).
  // Or if it didn't prompt and just added a new `stage` column, it will have the default "applied".
  // Let's just update based on the current `stage` and `status` values.

  console.log("Updating 'exam' stage to 'assessment'...");
  await db.update(jobApplications)
    .set({ stage: "assessment" })
    .where(sql`${jobApplications.stage} = 'exam'`);

  console.log("Updating 'rejected' stage to 'applied' and status to 'rejected'...");
  await db.update(jobApplications)
    .set({ stage: "applied", status: "rejected" })
    .where(sql`${jobApplications.stage} = 'rejected'`);

  console.log("Updating 'ghosted' stage to 'applied' and status to 'ghosted'...");
  await db.update(jobApplications)
    .set({ stage: "applied", status: "ghosted" })
    .where(sql`${jobApplications.stage} = 'ghosted'`);

  console.log("Updating remaining valid stages to have 'pending' status...");
  await db.update(jobApplications)
    .set({ status: "pending" })
    .where(sql`${jobApplications.status} = 'applied' OR ${jobApplications.status} = 'interview' OR ${jobApplications.status} = 'offer' OR ${jobApplications.status} = 'hired' OR ${jobApplications.status} = 'exam'`);

  console.log("✅ Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
