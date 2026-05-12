"use client";

import { useState } from "react";
import DeveloperModal from "@/components/modals/DeveloperModal";

export default function SidebarAbout() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setShowModal(true)}
          className="w-full text-left px-2 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          The Developer
        </button>
      </div>

      <DeveloperModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
