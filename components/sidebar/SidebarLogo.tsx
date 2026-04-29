"use client";

import Image from "next/image";

export default function SidebarLogo() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
      <Image
        src="/jobpace-logo-blue.png"
        alt="JobPace"
        width={33}
        height={33}
        className="rounded-lg shadow-sm pointer-events-none"
        priority
      />
      <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-white">
        JobPace
      </span>
    </div>
  );
}
