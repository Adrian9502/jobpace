"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarUserFooterProps {
  userName: string;
  userImage?: string | null;
  initials: string;
}

export default function SidebarUserFooter({
  userName,
  userImage,
  initials,
}: SidebarUserFooterProps) {
  return (
    <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800">
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={28}
            height={28}
            className="rounded-full shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-zinc-900 dark:text-zinc-100 text-xs font-medium truncate">
            {userName}
          </div>
          <div className="text-zinc-400 dark:text-zinc-500 text-xs">
            Sign out
          </div>
        </div>
        <LogOut className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      </button>
    </div>
  );
}
