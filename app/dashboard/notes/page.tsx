import { getPersonalNotes } from "@/lib/queries";
import NotesClient from "@/components/NotesClient";

export const metadata = {
  title: "Notes - JobPace",
};

export default async function NotesPage() {
  const notes = await getPersonalNotes();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Notes
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Organize your job search research and personal notes.
        </p>
      </div>
      <NotesClient initialNotes={notes} />
    </>
  );
}
