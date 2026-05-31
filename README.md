# JobPace

### Track your journey to your next job.

## What is JobPace?

JobPace is a comprehensive job hunting tracker built for everyone who wants to stay organized and stress-free during their job search. Instead of losing track of applications or overthinking the process, JobPace gives you a structured way to manage your journey from application to hired.

Born on **April 6, 2026**.

## ✨ Key Features

- **📊 Dashboard & Analytics:** Get a bird's-eye view of your job search progress with beautiful charts powered by Recharts.
- **📋 Kanban Board:** Easily drag and drop your applications across different stages (Applied, Interview, Offer, etc.) using DnD Kit.
- **🤖 AI Assistant:** Context-aware AI (powered by Groq & Llama 3.1) to help you manage your applications, update statuses, and get job search advice.
- **📅 Calendar & Timeline:** Keep track of your interviews, deadlines, and follow-ups.
- **📝 Notes & Documents:** Centralize your resumes, cover letters, and interview notes.
- **📧 Email Templates:** Save time with ready-to-use email templates for follow-ups and thank you notes.
- **📥 Import/Export:** Manage your data easily with CSV support via PapaParse.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) & React 19
- **Database:** PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** Auth.js (NextAuth v5)
- **Styling:** Tailwind CSS v4 & Framer Motion
- **AI Integration:** [Groq SDK](https://console.groq.com/) (Llama 3.1)
- **Emails:** React Email & Nodemailer
- **Media & Icons:** Next Cloudinary, Lucide React, React Icons
- **Validation:** Zod

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and PostgreSQL (or Podman/Docker for the database) installed.

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file based on the `.env` template and fill in your details:

- Database connection string
- Auth secret and providers
- Groq API Key (for AI features)
- Cloudinary credentials (if used)

### 3. Database Setup

Push the schema to your database:

```bash
npm run db:push
```

(Optional) Seed the database:

```bash
npm run db:seed
```

### 4. Run the Development Server

```bash
npm run dev
# Starts Next.js and a Podman Compose DB instance concurrently
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 📁 Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components organized by feature (kanban, dashboard, ai, etc.)
- `lib/` - Utility functions, auth config, and AI tools
- `db/` & `drizzle/` - Database schemas, migrations, and seed data
- `emails/` - React Email templates

## Deploy on Vercel

The easiest way to deploy this app is via the [Vercel Platform](https://vercel.com/new). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
