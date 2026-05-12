"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import FeedbackModal from "@/components/modals/FeedbackModal";

export default function SidebarFeedback() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 w-full text-left px-2 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Send Feedback
        </button>
      </div>

      <FeedbackModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
