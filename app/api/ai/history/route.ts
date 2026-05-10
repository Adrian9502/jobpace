import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { getChatHistory } from "@/lib/queries/ai";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getChatHistory(session.user.id);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[AI History Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
