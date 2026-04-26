import { auth } from "./auth";
import { DEV_USER } from "./dev-auth";

/**
 * Returns the full session (or dev-user stub).
 * Use this in layouts / server components that need user info.
 */
export async function getSession() {
  const isDev = process.env.NEXT_PUBLIC_DEV_MODE === "true";
  return isDev ? DEV_USER : await auth();
}

/**
 * Returns the authenticated user ID, or throws if unauthorized.
 * Use this in server actions / queries that guard data access.
 */
export async function getUserId(): Promise<string> {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}
