import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { jobApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { groq, MODEL } from "@/lib/ai/groq";
import { tools } from "@/lib/ai/tools";
import { executeTool } from "@/lib/ai/agent";
import { buildSummary } from "@/lib/ai/summarize";
import type Groq from "groq-sdk";

// ──────────────────────────────────────────────
// Simple in-memory rate limiter (MVP)
// ──────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_HOUR = 20;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour from now
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  entry.count++;
  return true;
}

// ──────────────────────────────────────────────
// System prompt builder
// ──────────────────────────────────────────────

function buildSystemPrompt(summary: string): string {
  return `
You are JobPace AI — a focused job search assistant embedded inside JobPace, a job application tracking app for Filipino job seekers.

The user's current application data:
${summary}

YOUR ONLY JOB:
You help users with their job applications. Nothing else.

STRICT RULES — follow every one of these:

1. SCOPE — Only respond to:
   - Questions about the user's job applications (counts, stages, companies, dates)
   - Actions on applications (update stage, update status, add, delete)
   - Job search advice directly related to their situation (follow-up tips, interview prep)
   - Career questions relevant to their active applications
   
   If the message is unrelated to job searching or their applications, respond ONLY with:
   "I'm focused on helping you with your job search. Is there anything about your applications I can help you with?"
   Do NOT call any tool for unrelated messages. Do NOT elaborate.

2. TOOLS — use only when genuinely needed:
   - get_applications: ONLY call when user asks for specific details not in the summary above. Do NOT call for greetings, general questions, or messages that don't require application data.
   - update_stage: when user says "move X to ghosted", "got rejected by X", "interview at X"
   - update_status: when user says "passed the exam at X", "failed the interview", "it's ongoing"
   - add_application: ONLY after you have BOTH companyName AND position confirmed. Ask for missing info first, never fill with placeholders.
   - delete_application: ONLY after explicit user confirmation in the PREVIOUS message. Always ask first.

3. ANSWER FROM SUMMARY FIRST:
   The summary above already contains: total count, stage breakdown, last 5 applications, upcoming interviews, overdue follow-ups.
   Answer questions using the summary data BEFORE calling get_applications.
   Only call get_applications if the user needs details not covered in the summary.

4. MATH, TRIVIA, PHILOSOPHY, SMALL TALK — do not engage. Use the exact response in Rule 1.

5. DATA ACCURACY — never invent application data. If you don't have it in the summary and get_applications hasn't been called, say "Let me check that for you" then call get_applications.

6. RESPONSE LENGTH — max 3 sentences unless explaining something complex. Be direct.

7. MULTIPLE MATCHES — if ilike returns 2+ companies, list them and ask which one before acting.

8. DELETE — always ask: "Are you sure you want to delete [company] - [position]? Reply 'yes delete it' to confirm." Never delete without this.

9. STAGE vs STATUS reminder:
   stage = pipeline position: applied | screening | interview | assessment | final_interview | offer | hired | rejected | ghosted | withdrawn
   status = outcome state: pending | ongoing | passed | failed

10. TONE — friendly, encouraging, brief. Filipino job market is competitive — acknowledge difficulty when relevant. Use ₱ for salary. Dates in Asia/Manila timezone.
`;
}

// ──────────────────────────────────────────────
// POST handler
// ──────────────────────────────────────────────

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  action?: {
    tool: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
    success: boolean;
  } | null;
};

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Rate limit check
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error:
            "You've reached the limit of 20 AI requests per hour. Please try again later.",
        },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const messages: ChatMessage[] = body.messages || [];

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // 4. Truncate messages: keep first + last 11 = max 12
    let truncated: ChatMessage[];
    if (messages.length > 12) {
      truncated = [messages[0], ...messages.slice(-11)];
    } else {
      truncated = messages;
    }

    // 5. Build system prompt with lean context
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));

    const summary = buildSummary(applications);
    const systemPrompt = buildSystemPrompt(summary);

    // 6. Format messages for Groq
    const groqMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...truncated.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // 7. Pass 1 — Groq with tools (non-streaming to handle tool calls)
    const pass1 = await groq.chat.completions.create({
      model: MODEL,
      messages: groqMessages,
      tools,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 1024,
    });

    const choice = pass1.choices[0];
    const toolCalls = choice.message.tool_calls;

    // No tool call — stream the direct response
    if (!toolCalls || toolCalls.length === 0) {
      const text = choice.message.content || "I'm not sure how to help with that. Could you rephrase?";

      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const payload = JSON.stringify({
            message: text,
            action: null,
          });
          controller.enqueue(encoder.encode(payload));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
    }

    // 8. Execute the first tool call
    const toolCall = toolCalls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    const toolResult = await executeTool(toolName, toolArgs, userId);

    // 9. Pass 2 — Groq with tool result to get final response
    const pass2Messages: Groq.Chat.ChatCompletionMessageParam[] = [
      ...groqMessages,
      choice.message as Groq.Chat.ChatCompletionMessageParam,
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      },
    ];

    const pass2 = await groq.chat.completions.create({
      model: MODEL,
      messages: pass2Messages,
      temperature: 0.4,
      max_tokens: 1024,
    });

    const finalText =
      pass2.choices[0].message.content ||
      "Done! Let me know if you need anything else.";

    // 10. Stream the final response with action metadata
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const payload = JSON.stringify({
          message: finalText,
          action: {
            tool: toolName,
            args: toolArgs,
            result: toolResult,
            success: toolResult.success,
          },
        });
        controller.enqueue(encoder.encode(payload));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[AI Chat Error]", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
