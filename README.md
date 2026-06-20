# JobPace (job-trackr)

### Track your journey to your next job.

JobPace is a comprehensive job hunting tracker built to help you stay organized and stress-free during your job search. Instead of losing track of applications or overthinking the process, JobPace gives you a structured way to manage your journey from application to hired.

## ✨ Key Features

- **📊 Dashboard & Analytics:** Get a bird's-eye view of your job search progress with beautiful charts powered by Recharts.
- **📋 Kanban Board:** Easily drag and drop your applications across different stages (Applied, Interview, Offer, etc.) using DnD Kit.
- **🤖 AI Assistant:** Context-aware AI (powered by Groq & Llama 3.1) to help you manage your applications, update statuses, and get job search advice.
- **📅 Calendar & Timeline:** Keep track of your interviews, deadlines, and follow-ups.
- **📝 Notes & Documents:** Centralize your resumes, cover letters, and interview notes using Cloudinary.
- **📧 Email Templates:** Save time with ready-to-use email templates for follow-ups and thank you notes.
- **📥 Import/Export:** Manage your data easily with CSV support via PapaParse.

## 🛠️ Tech Stack

- **Framework:** Next.js 16.2 (App Router) & React 19.2
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Auth.js (NextAuth v5 beta)
- **Styling:** Tailwind CSS v4 & Framer Motion
- **AI Integration:** Groq SDK (Llama 3.1)
- **Emails:** React Email & Nodemailer
- **Media:** Next Cloudinary
- **Validation:** Zod

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and Podman/Docker installed for the database container.

### 1. Clone & Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file based on the `.env` template and fill in your details:

- `DATABASE_URL` / `DATABASE_URL_LOCAL`
- `AUTH_SECRET` and Auth Providers configuration
- `GROQ_API_KEY` (for AI features)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### 3. Run the Development Server

The `dev` script runs both the Next.js server and a Podman compose instance concurrently.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### 4. Database Management

Push the schema to your local database:

```bash
npm run db:push
```

To seed the database with mock data:

```bash
npm run db:seed
```

To view and edit your database using Drizzle Studio:

```bash
npm run db:studio
```

## 📁 Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components organized by feature (kanban, dashboard, ai, etc.)
- `lib/` - Utility functions, queries, actions, and AI tools
- `db/` & `drizzle/` - Database schemas, migrations, and seed scripts
- `emails/` - React Email templates

## Deploy on Vercel

The easiest way to deploy this app is via the [Vercel Platform](https://vercel.com/new). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
