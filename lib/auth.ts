import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "./db"; // named import now
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { sendWelcomeEmail } from "./email";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  adapter: PostgresAdapter(pool),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user) return null;

        // User exists but has no password (Google-only account)
        if (!user.password) return null;

        // Verify password
        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        // Email not verified — handled in the server action before calling signIn,
        // but double-check here as a safety net
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async session({ session, user }) {
      // Expose user.id in the session object
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    // Send welcome email for OAuth sign-ups (Google users)
    async createUser({ user }) {
      if (user.email && user.name) {
        await sendWelcomeEmail(user.email, user.name);
      }
    },
    // Auto-verify email for OAuth sign-ups (Google users are inherently verified)
    async linkAccount({ user }) {
      if (user.id) {
        await db
          .update(users)
          .set({ emailVerified: new Date() })
          .where(eq(users.id, user.id));
      }
    },
  },
});
