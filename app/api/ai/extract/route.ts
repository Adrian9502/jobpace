import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { groq, MODEL } from "@/lib/ai/groq";

// ──────────────────────────────────────────────
// Simple in-memory rate limiter
// ──────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_HOUR = 20;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + 60 * 60 * 1000,
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const systemPrompt = `You are a strict data extraction AI.
Your job is to read the provided text (a job description or LinkedIn post) and extract specific fields in JSON format.
If you are not 100% sure about a field, return null rather than guessing.

You MUST return a JSON object with EXACTLY these keys:
- companyName (string | null): The name of the company hiring.
- position (string | null): The job title.
- location (string | null): City, region, or country (e.g., "Makati", "BGC", "Remote").
- workSetup (string | null): MUST be exactly one of: "remote", "hybrid", "onsite".
- employmentType (string | null): MUST be exactly one of: "full-time", "part-time", "contractual", "project-based", "ojt-internship".

Do NOT include any extra keys.
Do NOT include markdown wrapping like \`\`\`json. Just output the JSON.`;

    const response = await groq.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[AI Extract Error]", error);
    return NextResponse.json(
      { error: "Failed to extract data." },
      { status: 500 }
    );
  }
}
