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
  return `You are JobPace AI — a concise, practical job search assistant for Filipino job seekers.

The user's application data:
${summary}

IMPORTANT RULES:
- stage and status are SEPARATE fields. Stage = pipeline position. Status = outcome state.
- update_stage for: "move to ghosted", "got rejected", "interview scheduled", "received offer"
- update_status for: "passed the exam", "failed the interview", "it's ongoing"
- For delete: ALWAYS ask "Are you sure you want to delete [company] - [position]? Reply 'yes' to confirm." Never call delete_application without explicit confirmation in the previous user message.
- If ilike returns multiple matches, list them and ask which one.
- Salary always in ₱. Dates in Asia/Manila timezone.
- Keep responses under 3 sentences unless explaining something complex.
- Be encouraging. Filipino job market is tough — acknowledge that when relevant.`;
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
