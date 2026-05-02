"use client";

import { useState } from "react";
import { Trash2, Save, Clock } from "lucide-react";
import type { PersonalNoteRow } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

interface Props {
  note: PersonalNoteRow;
  isPending: boolean;
  onSave: (title: string, content: string) => void;
  onDelete: () => void;
}

export default function NoteEditor({
  note,
  isPending,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const hasChanges =
    title !== (note.title || "") || content !== (note.content || "");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor toolbar */}
      <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          <Clock className="w-3 h-3" />
          {formatDate(note.updatedAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSave(title, content)}
            disabled={isPending || !hasChanges}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              hasChanges
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-10 py-10 sm:px-16 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full text-3xl sm:text-[2rem] font-bold bg-transparent border-none focus:outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 text-zinc-900 dark:text-zinc-50 leading-tight"
          />
          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-700" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something…"
            className="w-full min-h-[calc(100vh-340px)] text-[15px] bg-transparent border-none focus:outline-none resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-700 dark:text-zinc-300 leading-[1.8] font-serif"
          />
        </div>
      </div>
    </div>
  );
}
