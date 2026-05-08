import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all dashboard routes
  matcher: ["/dashboard/:path*"],
};
