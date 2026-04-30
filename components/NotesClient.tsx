"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Trash2, FileText, Save, Clock } from "lucide-react";
import { createNote, updateNote, deleteNote } from "@/lib/actions";
import type { PersonalNoteRow } from "@/lib/queries";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Props {
  initialNotes: PersonalNoteRow[];
}

function NoteEditor({
  note,
  isPending,
  onSave,
  onDelete,
}: {
  note: PersonalNoteRow;
  isPending: boolean;
  onSave: (title: string, content: string) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const hasChanges =
    title !== (note.title || "") || content !== (note.content || "");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          Last edited {formatDate(note.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            disabled={isPending}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSave(title, content)}
            disabled={isPending || !hasChanges}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              hasChanges
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full text-3xl sm:text-4xl font-bold bg-transparent border-none focus:outline-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your thoughts..."
            className="w-full h-[calc(100vh-350px)] text-lg bg-transparent border-none focus:outline-none resize-none placeholder:text-zinc-200 dark:placeholder:text-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif"
          />
        </div>
      </div>
    </div>
  );
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

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddNote = () => {
    startTransition(async () => {
      const title = "New Note";
      const content = "";
      const result = await createNote(title, content);
      if (result.success) {
        toast.success("Note created");
        // Re-fetch or update local state logic would go here if not using revalidatePath properly
        // For simplicity, we'll assume revalidatePath triggers a server refresh of the props
      } else {
        toast.error(result.error || "Failed to create note");
      }
    });
  };

  const handleSave = (noteId: string, title: string, content: string) => {
    startTransition(async () => {
      const result = await updateNote(noteId, title, content);
      if (result.success) {
        toast.success("Note saved");
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
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-1 overflow-hidden gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Notes
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Organize your job search research and personal notes.
          </p>
        </div>
        {/* Notes Sidebar */}
        <div className="w-full sm:w-80 flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                My Notes
              </h2>
              <button
                onClick={handleAddNote}
                disabled={isPending}
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`w-full text-left p-3 rounded-xl transition-all group ${
                  activeNoteId === note.id
                    ? "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <p
                  className={`text-sm font-semibold truncate ${
                    activeNoteId === note.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {note.title || "Untitled"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
            {filteredNotes.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No notes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
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
              <div className="w-16 h-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No Note Selected
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Select a note from the sidebar or create a new one to get
                started.
              </p>
              <button
                onClick={handleAddNote}
                disabled={isPending}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Create First Note
              </button>
            </div>
          )}
        </div>
      </div>
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
