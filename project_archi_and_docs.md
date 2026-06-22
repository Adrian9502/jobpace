# JobPace Product Architecture & Specifications Document

## 1. Executive Summary

JobPace is a comprehensive, AI-powered job-hunting tracker designed to help job seekers structure and manage their application journey. By combining project management tools (like a Kanban board and analytics dashboard) with an intelligent, context-aware AI assistant, JobPace streamlines the job search—shifting the experience from a stressful spreadsheet into an organized, automated pipeline.

## 2. Core Features & Capabilities

- **Visual Analytics:** A unified dashboard with charts (via Recharts) tracking job search performance.
- **Kanban Pipeline:** A drag-and-drop board (powered by DnD Kit) mimicking ATS (Applicant Tracking Systems) to transition applications through stages like _Applied_, _Interview_, _Offer_, and _Hired_.
- **AI Agent Integration:** A built-in chat assistant leveraging Groq and Llama 3.1 that is directly hooked into the user's data. It handles intent mapping (e.g., _"I just got ghosted by Accenture"_) and triggers automated database updates via function calling.
- **Organization & Documents:** Centralized tracking for calendar events (interviews/follow-ups), cloud-stored documents (via Cloudinary), and templated emails.
- **Data Portability:** Importer/exporter system accommodating CSVs (via PapaParse).

## 3. System Architecture

JobPace utilizes a full-stack Next.js architecture (the "T3/Modern Next.js" stack) leveraging Server Components, Server Actions, and a containerized database.

### A. Frontend Architecture (Next.js 16.2 App Router)

- **React Server Components (RSC):** The application relies heavily on RSCs to securely fetch user data directly at the component level without exposing API routes.
- **Client Components:** Used selectively for rich interactions like the drag-and-drop Kanban board (`@dnd-kit`), chart rendering (`recharts`), form validations, and the interactive AI Chat window.
- **Styling & UI:** Built with Tailwind CSS v4 alongside Framer Motion for smooth pipeline transitions and UI animations.
- **Routing:** Leveraging Next.js App Router for nested layouts (e.g., `layout.tsx` serving the Dashboard shell and sidebar over all sub-pages).

### B. API & Backend Services (Next.js Edge / Node Runtimes)

- **Server Actions:** Direct database mutations (creating apps, moving stages in Kanban, updating profile) bypass traditional REST APIs and use Next.js Server Actions placed in `actions`.
- **Route Handlers:** Located in `api`, primarily utilized for specific Webhook/AI streaming tasks (`api/ai/chat/route.ts`) and Auth.js callbacks (`api/auth/`).
- **Cron/Workers:** Endpoints in `api/cron/` handle scheduled tasks likely related to generating reminders (stale applications, upcoming interviews).

### C. Database Architecture (PostgreSQL + Drizzle ORM)

- **Postgres Container:** Deployed via Docker/Podman Compose locally (`docker-compose.yml`) providing a reliable development and production-ready environment.
- **Drizzle ORM:** Used as the type-safe abstraction layer over SQL.
- **Schema Design (`schema.ts`):**
  - _Auth Tables:_ standard NextAuth linkage tables (`users`, `accounts`, `sessions`).
  - _Job Applications Table:_ A highly detailed schema matching local hiring nuances. Fields include `companyName`, `stage`, `salaryMin/Max`, `workSetup`, `source`, and timestamp trackers for analytics (`dateApplied`, `interviewDate`).

## 4. AI Assistant Architecture 🤖

One of the most complex pieces of the architectural puzzle is the AI Integration documented in `JOBPACE_AI_INTEGRATION.md`.

- **SDK & Provider:** Uses the Groq SDK and Llama 3.1 (8B), optimized for ultra-fast, low-latency inference.
- **Tool Calling (Agentic AI):** Instead of just conversing, the AI is granted structural access to application data via function/tool calling.
- **Intent Resolution:** When a user types _"Move BDO to rejected"_, the AI recognizes the intent to mutate data.
- **Function Execution:** The LLM maps the intent to predefined schema tools in `tools.ts`, executing functions like `updateApplicationStatus(companyName: "BDO", status: "rejected")`.
- **Data Pipeline:** The executed tool directly interfaces with Drizzle ORM to mutate the Postgres Database.
- **Generative Feedback:** Once the Postgres action resolves, the server streams an updated context response back to the client UI.

## 5. Authentication & Security Architecture

- **Auth.js (NextAuth v5 beta):** Manages all session state.
- **Middleware Protection:** Next.js Middleware (`middleware.ts`) is placed at the edge to automatically intercept generic requests attempting to enter `/dashboard/:path*`. Users without a valid JWT/session token are blocked without rendering the component tree.
- **Token & Password Flow:** Supports secure credential flows (`bcryptjs`), complete with custom NextAuth provider callbacks, verification tokens, and password reset procedures sent via Nodemailer + React Email.

## 6. Cloud & External Integrations

- **File Storage:** Cloudinary handles resume and application document uploads (`next-cloudinary`).
- **Email Sending:** Automated templates (Follow-up reminders, Verification, Stale applications) are built in React using `@react-email` and delivered reliably.
- **Vercel Analytics:** Out-of-the-box performance and traffic tracking integrated.

---

### Summary Architectural Flow

When a user updates a job's status via drag-and-drop on the Kanban board or by asking the AI Assistant:

```
UI Component / AI Input Context
  └──> Next.js Server Action / API Route
        └──> Zod Payload Validation
              └──> Drizzle ORM Execution
                    └──> PostgreSQL Update
                          └──> Next.js Cache Revalidation
                                └──> UI Update automatically reflects within milliseconds
```
