"use client";

import { useState, useTransition } from "react";
import { Plus, Search, FileText, StickyNote } from "lucide-react";
import { createNote, updateNote, deleteNote } from "@/lib/actions";
import type { PersonalNoteRow } from "@/lib/queries";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import DeleteConfirmModal from "./DeleteConfirmModal";
import NoteEditor from "@/components/notes/NoteEditor";
interface Props {
  initialNotes: PersonalNoteRow[];
}

export default function NotesClient({ initialNotes }: Props) {
  const notes = initialNotes;
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeNoteId = selectedId ?? notes[0]?.id ?? null;
  const selectedNote = notes.find((n) => n.id === activeNoteId) ?? null;

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.content ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddNote = () => {
    startTransition(async () => {
      const result = await createNote("New Note", "");
      if (result.success) {
        toast.success("Note created");
      } else {
        toast.error(result.error || "Failed to create note");
      }
    });
  };

  const handleSave = (noteId: string, title: string, content: string) => {
    startTransition(async () => {
      const result = await updateNote(noteId, title, content);
      if (result.success) {
        toast.success("Saved");
      } else {
        toast.error(result.error || "Failed to save note");
      }
    });
  };

  const handleDelete = () => {
    if (!activeNoteId) return;
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* ── Sidebar ────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3 space-y-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {notes.length} notes
              </span>
            </div>
            <button
              onClick={handleAddNote}
              disabled={isPending}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-7 h-7 text-zinc-200 dark:text-zinc-800 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">No notes found</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isActive = activeNoteId === note.id;
              const preview =
                (note.content ?? "").trim().slice(0, 80) || "No content";

              return (
                <button
                  key={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all group ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700"
                      : "hover:bg-white/70 dark:hover:bg-zinc-800/50 border border-transparent"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold truncate leading-snug ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {note.title || "Untitled"}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5 leading-relaxed">
                    {preview}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1.5">
                    {formatDate(note.updatedAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Editor ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            isPending={isPending}
            onSave={(title, content) =>
              handleSave(selectedNote.id, title, content)
            }
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-4">
              <StickyNote className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No note selected
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xs">
              Pick a note from the sidebar or create a new one.
            </p>
            <button
              onClick={handleAddNote}
              disabled={isPending}
              className="mt-5 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {selectedNote && (
        <DeleteConfirmModal
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Note"
          description="Are you sure you want to permanently delete this note?"
          itemName={selectedNote.title || "Untitled Note"}
          onConfirm={async () => {
            const result = await deleteNote(selectedNote.id);
            if (result.success) {
              toast.success("Note deleted");
              const nextNote = notes.find((n) => n.id !== selectedNote.id);
              setSelectedId(nextNote?.id || null);
            } else {
              toast.error(result.error ?? "Failed to delete note.");
              throw new Error(result.error);
            }
          }}
        />
      )}
    </div>
  );
}
