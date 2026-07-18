import "dotenv/config";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { UpdateEmail } from "../emails/UpdateEmail";

async function main() {
  console.log("🚀 Starting email broadcast...");

  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} users in the database.`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const alreadySent = new Set([
    "jdbonto@ccc.edu.ph",
    "pojapeg581@kynninc.com",
    "dikowe7289@lohinja.com",
    "bonmirm@gmail.com",
    "bonmir94@gmail.com",
    "maceca2282@kynninc.com",
    "defomo8778@lohinja.com",
    "posayis424@lohinja.com",
    "sodevop378@kynninc.com",
    "nepava3482@kynninc.com",
    "hepafe1095@kynninc.com",
    "tinegi4940@kynninc.com",
    "vaxin84400@lohinja.com",
    "dev@local.com",
  ]);

  console.log(`Rendering email with time: ${time}`);
  const html = await render(UpdateEmail({ time }));

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const user of allUsers) {
    if (!user.email) continue;
    
    if (alreadySent.has(user.email)) {
      console.log(`⏩ Skipping already sent email: ${user.email}`);
      skipCount++;
      continue;
    }
    
    try {
      await transporter.sendMail({
        from: `"JobPace" <${process.env.EMAIL_SERVER_USER}>`,
        to: user.email,
        subject: "JobPace Update and Fixes - 7-18-26",
        html,
      });
      console.log(`✅ Sent to ${user.email}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to send to ${user.email}:`, error);
      failCount++;
    }
    
    // Add a small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Broadcast completed! Success: ${successCount}, Failed: ${failCount}, Skipped: ${skipCount}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Broadcast failed:", err);
  process.exit(1);
});
