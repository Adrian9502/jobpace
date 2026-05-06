import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!token) {
      return NextResponse.redirect(
        `${appUrl}/?error=missing_token`,
      );
    }

    // Look up the token
    const [verificationRecord] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);

    if (!verificationRecord) {
      return NextResponse.redirect(
        `${appUrl}/?error=invalid_token`,
      );
    }

    // Check if token has expired
    if (new Date() > verificationRecord.expires) {
      // Clean up expired token
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, verificationRecord.identifier),
            eq(verificationTokens.token, token),
          ),
        );

      return NextResponse.redirect(
        `${appUrl}/?error=token_expired`,
      );
    }

    // Find the user by email (identifier)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, verificationRecord.identifier))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(
        `${appUrl}/?error=user_not_found`,
      );
    }

    // Set emailVerified
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, verificationRecord.identifier),
          eq(verificationTokens.token, token),
        ),
      );

    return NextResponse.redirect(
      `${appUrl}/?verified=true`,
    );
  } catch (error) {
    console.error("Email verification error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/?error=verification_failed`,
    );
  }
}
