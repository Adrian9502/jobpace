# JobPace AI Integration Plan 🤖

AI assistant that is context-aware of the user's job application data and can take actions like updating, adding, and querying applications via chat.

**AI Provider:** Groq (free, fast, great tool/function calling support)
**Model:** Llama 3.1 (via Groq)

---

## 🎯 What It Does

```
User: "Move Accenture to ghosted"
  ↓
AI understands intent
  ↓
AI calls → updateApplicationStatus(companyName: "Accenture", status: "ghosted")
  ↓
DB updates via Drizzle
  ↓
AI responds: "Done! I've moved your Accenture Philippines application to Ghosted 👻"
```

---

## 🗣️ Example Conversations

```
User: "Move Accenture to ghosted"
AI:   "Done! Moved Accenture Philippines (Junior Software Developer) to Ghosted 👻"

User: "I just applied to Globe for a Network Engineer role from Jobstreet"
AI:   "Added! Globe Telecom - Network Engineer is now tracked. Good luck! 🤞"

User: "How many companies ghosted me?"
AI:   "You've been ghosted by 3 companies — Globe, BDO, and Concentrix.
       That's actually normal in PH. Keep applying! 💪"

User: "Which application should I follow up on?"
AI:   "Your application at Company xD (Software Developer) was 2 weeks ago
       with no update. That's a good one to follow up on!"
```

---

## 🏗️ Folder Structure

```
app/
  api/
    ai/
      chat/route.ts           ← main AI chat endpoint
  dashboard/
    ai/page.tsx               ← chat UI page
components/
  ai/
    ChatWindow.tsx
    ChatInput.tsx
    ChatMessage.tsx
lib/
  ai/
    groq.ts                   ← Groq client setup
    tools.ts                  ← tool definitions (what AI can call)
    agent.ts                  ← agent logic (decides which tool to call)
```

---

## ⚙️ Setup

### 1. Install Groq SDK
```bash
npm install groq-sdk
```

### 2. Get Free API Key
Go to: https://console.groq.com
- Sign up → Create API Key → Copy it

### 3. Add to `.env.local`
```env
GROQ_API_KEY=your-groq-api-key-here
```

---

## 📁 Files to Create

### `lib/ai/groq.ts` — Groq client
```ts
import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const MODEL = "llama-3.1-8b-instant"; // free and fast
```

---

### `lib/ai/tools.ts` — Tool definitions
These are the actions the AI can take in your app.

```ts
export const tools = [
  {
    type: "function",
    function: {
      name: "get_applications",
      description: "Get all job applications for the current user. Use this to answer questions about their applications.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_application_status",
      description: "Update the status of a job application by company name or position.",
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "The name of the company e.g. Accenture Philippines",
          },
          status: {
            type: "string",
            enum: ["applied", "interview", "exam", "offer", "hired", "rejected", "ghosted"],
            description: "The new status to set",
          },
        },
        required: ["companyName", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_application",
      description: "Add a new job application for the user.",
      parameters: {
        type: "object",
        properties: {
          companyName: { type: "string" },
          position: { type: "string" },
          status: {
            type: "string",
            enum: ["applied", "interview", "exam", "offer", "hired", "rejected", "ghosted"],
          },
          source: {
            type: "string",
            enum: ["Jobstreet", "LinkedIn", "Kalibrr", "Indeed", "Referral", "Company Website", "Facebook", "Walk-in", "Other"],
          },
          location: { type: "string" },
          workSetup: {
            type: "string",
            enum: ["onsite", "hybrid", "remote"],
          },
          dateApplied: {
            type: "string",
            description: "ISO date string e.g. 2026-04-12",
          },
        },
        required: ["companyName", "position", "status", "dateApplied"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_application",
      description: "Delete a job application by company name. Always confirm with user before calling this.",
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "The name of the company to delete",
          },
        },
        required: ["companyName"],
      },
    },
  },
];
```

---

### `lib/ai/agent.ts` — Tool executor
This is where tools actually run against your DB.

```ts
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { ilike } from "drizzle-orm";

export async function executeTool(
  toolName: string,
  args: Record<string, string>,
  userId: string
) {
  switch (toolName) {
    case "get_applications": {
      const applications = await db
        .select()
        .from(jobApplications)
        .where(eq(jobApplications.userId, userId));
      return JSON.stringify(applications);
    }

    case "update_application_status": {
      const { companyName, status } = args;
      const updated = await db
        .update(jobApplications)
        .set({ status, updatedAt: new Date() })
        .where(
          and(
            eq(jobApplications.userId, userId),
            ilike(jobApplications.companyName, `%${companyName}%`)
          )
        )
        .returning();

      if (updated.length === 0) {
        return JSON.stringify({ error: `No application found for "${companyName}"` });
      }
      return JSON.stringify({ success: true, updated: updated[0] });
    }

    case "add_application": {
      const { companyName, position, status, source, location, workSetup, dateApplied } = args;
      const newApp = await db
        .insert(jobApplications)
        .values({
          id: crypto.randomUUID(),
          userId,
          companyName,
          position,
          status,
          source: source ?? null,
          location: location ?? null,
          workSetup: workSetup ?? null,
          dateApplied: new Date(dateApplied),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return JSON.stringify({ success: true, application: newApp[0] });
    }

    case "delete_application": {
      const { companyName } = args;
      const deleted = await db
        .delete(jobApplications)
        .where(
          and(
            eq(jobApplications.userId, userId),
            ilike(jobApplications.companyName, `%${companyName}%`)
          )
        )
        .returning();

      if (deleted.length === 0) {
        return JSON.stringify({ error: `No application found for "${companyName}"` });
      }
      return JSON.stringify({ success: true, deleted: deleted[0] });
    }

    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}
```

---

### `app/api/ai/chat/route.ts` — Main chat API endpoint

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { groq, MODEL } from "@/lib/ai/groq";
import { tools } from "@/lib/ai/tools";
import { executeTool } from "@/lib/ai/agent";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id!;
  const { messages } = await req.json();

  // Fetch user's applications as context
  const applications = await db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.userId, userId));

  const systemPrompt = `
You are JobPace AI — a friendly, practical job search assistant for Filipino fresh graduates.
You help users track and manage their job applications.

The user currently has these job applications:
${JSON.stringify(applications, null, 2)}

You can take actions using the available tools:
- get_applications: fetch latest application data
- update_application_status: change the status of an application
- add_application: add a new job application
- delete_application: delete an application (always confirm first)

Guidelines:
- Be friendly, encouraging, and practical
- Use Filipino context (mention PH job market, common companies, etc.)
- Use ₱ for salary references
- For delete actions, always confirm with the user first before executing
- Keep responses short and clear
- Use emojis sparingly but naturally
`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    tools: tools as any,
    tool_choice: "auto",
    max_tokens: 1024,
  });

  const message = response.choices[0].message;

  // If AI wants to call a tool
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    // Execute the tool
    const toolResult = await executeTool(toolName, toolArgs, userId);

    // Send result back to AI for final response
    const finalResponse = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResult,
        },
      ],
      max_tokens: 1024,
    });

    return NextResponse.json({
      message: finalResponse.choices[0].message.content,
      action: { tool: toolName, args: toolArgs, result: JSON.parse(toolResult) },
    });
  }

  // Normal text response (no tool call)
  return NextResponse.json({
    message: message.content,
    action: null,
  });
}
```

---

### `app/dashboard/ai/page.tsx` — Chat UI page

```tsx
"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your JobPace AI assistant 👋 I can help you track applications, update statuses, and give you job search advice. What can I do for you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([...updatedMessages, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="AI Assistant">
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-[#0052CC] text-white"
                    : "bg-white border border-[#DFE1E6] text-[#172B4D]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#DFE1E6] px-4 py-3 rounded-lg text-sm text-[#5E6C84]">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder='Try: "Move Accenture to ghosted" or "How many applications do I have?"'
            className="flex-1 px-4 py-2.5 border border-[#DFE1E6] rounded text-sm text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded hover:bg-[#0747A6] disabled:opacity-50 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## 🚀 Build Order

```
Step 1 — Read only (easiest, do this first)
  ✅ AI can answer questions about applications
  ✅ "How many did I apply?", "Which ones are ghosted?"
  ✅ Context-aware responses using real DB data

Step 2 — Write actions
  ⬜ Update status via chat
  ⬜ Add new application via chat
  ⬜ Confirmation step before delete

Step 3 — Smart features
  ⬜ Follow-up suggestions based on dates
  ⬜ Job search coaching tips
  ⬜ Cover letter generator per application
```

---

## ⚠️ Important Notes

- **Delete actions** — always add a confirmation message in the UI before executing. AI should ask "Are you sure you want to delete X?" first.
- **Groq free tier limits** — 6000 requests/day on free plan, more than enough for MVP
- **Tool calls cost more tokens** — keep system prompt concise once you optimize
- **`ilike`** in Drizzle does case-insensitive matching — so "accenture" matches "Accenture Philippines"
- Add the AI page to your sidebar under a new section or under **Insights**

---

## 🔗 Resources

- Groq Console (get API key): https://console.groq.com
- Groq SDK docs: https://console.groq.com/docs
- Groq supported models: https://console.groq.com/docs/models
- Drizzle ORM docs: https://orm.drizzle.team/docs
