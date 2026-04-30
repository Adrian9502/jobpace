import { getPersonalNotes } from "@/lib/queries";
import NotesClient from "@/components/NotesClient";

export const metadata = {
  title: "Notes - JobPace",
};

export default async function NotesPage() {
  const notes = await getPersonalNotes();

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotesClient initialNotes={notes} />
    </div>
  );
}
