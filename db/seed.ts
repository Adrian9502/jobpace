import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db, pool } from "../lib/db";
import { jobApplications } from "../lib/schema";
import { DEV_USER } from "../lib/dev-auth";

const SAMPLE_APPLICATIONS = [
  {
    userId: DEV_USER.user.id,
    companyName: "TechCorp Global",
    position: "Frontend React Developer",
    location: "BGC, Taguig",
    workSetup: "hybrid",
    employmentType: "full-time",
    salaryMin: 45000,
    salaryMax: 60000,
    status: "applied",
    source: "LinkedIn",
    applicationLink: "https://linkedin.com/jobs/view/1234",
    dateApplied: new Date("2026-04-10"),
    followUpDate: new Date("2026-04-17"),
    jobDescription: "Looking for 2 years of React experience. Next.js is a plus.",
    notes: "They use Tailwind. Prepare for live coding interview.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "Innovate Solutions",
    position: "Junior Web Developer",
    location: "Makati",
    workSetup: "onsite",
    employmentType: "full-time",
    salaryMin: 30000,
    salaryMax: 40000,
    status: "interview",
    source: "Jobstreet",
    applicationLink: "https://jobstreet.com.ph/job/9988",
    dateApplied: new Date("2026-04-05"),
    followUpDate: new Date("2026-04-11"),
    jobDescription: "Maintenance of legacy PHP apps and new Node microservices.",
    notes: "HR interview went well. Technical interview scheduled for Friday 2 PM.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "CloudScale Inc",
    position: "Software Engineer",
    location: "Remote",
    workSetup: "remote",
    employmentType: "full-time",
    salaryMin: 70000,
    salaryMax: 90000,
    status: "exam",
    source: "Indeed",
    applicationLink: "https://indeed.com/view/7766",
    dateApplied: new Date("2026-04-08"),
    followUpDate: new Date("2026-04-15"),
    jobDescription: "Building multi-tenant SaaS architecture.",
    notes: "Take-home exam sent via HackerRank. Need to submit by Sunday.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "NexGen Fintech",
    position: "Frontend Engineer",
    location: "Ortigas",
    workSetup: "hybrid",
    employmentType: "full-time",
    salaryMin: 50000,
    salaryMax: 70000,
    status: "ghosted",
    source: "Kalibrr",
    applicationLink: "https://kalibrr.com/job/4433",
    dateApplied: new Date("2026-03-20"),
    followUpDate: new Date("2026-03-27"),
    jobDescription: "Fintech dashboard redesign using Vue or React.",
    notes: "Followed up twice, no response from recruiter.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "Agile Media",
    position: "Full Stack Intern",
    location: "Cebu City",
    workSetup: "onsite",
    employmentType: "ojt-internship",
    salaryMin: 15000,
    salaryMax: 20000,
    status: "offer",
    source: "Referral",
    applicationLink: "https://agilemedia.ph/careers",
    dateApplied: new Date("2026-04-01"),
    followUpDate: null,
    jobDescription: "3-month OJT program with potential for absorption.",
    notes: "Offer received! Need to decide by next week. Pay is decent for OJT.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "SysOps PH",
    position: "Junior DevOps",
    location: "Quezon City",
    workSetup: "remote",
    employmentType: "full-time",
    salaryMin: 35000,
    salaryMax: 45000,
    status: "rejected",
    source: "Company Website",
    applicationLink: "https://sysops.ph/careers/devops",
    dateApplied: new Date("2026-03-25"),
    followUpDate: null,
    jobDescription: "AWS and CI/CD pipelines. Terraform experience required.",
    notes: "Got rejection email. Need to study AWS more.",
  },
  {
    userId: DEV_USER.user.id,
    companyName: "Startup Hub",
    position: "UI/UX Developer",
    location: "BGC, Taguig",
    workSetup: "onsite",
    employmentType: "full-time",
    salaryMin: null,
    salaryMax: 65000,
    status: "hired",
    source: "Facebook",
    applicationLink: "https://facebook.com/groups/techph",
    dateApplied: new Date("2026-02-15"),
    followUpDate: null,
    jobDescription: "Design to code translation using Figma and React.",
    notes: "Signed the contract on March 1st. First day on May 15.",
  }
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  try {
    for (const app of SAMPLE_APPLICATIONS) {
      await db.insert(jobApplications).values(app);
      console.log(`✅ Seeded application: ${app.companyName}`);
    }
    console.log("🎉 Seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    // End the pool so the script can exit
    pool.end();
  }
}

seed();
