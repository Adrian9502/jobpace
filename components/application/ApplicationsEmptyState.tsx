import { FileText, Plus } from "lucide-react";

interface Props {
  hasApplications: boolean;
  onAdd: () => void;
}

export default function ApplicationsEmptyState({
  hasApplications,
  onAdd,
}: Props) {
  if (!hasApplications) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          No applications yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
          Start tracking your job hunt! Add your first application to see it
          here.
        </p>
        <button
          onClick={onAdd}
          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Your First Application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
      <div className="text-3xl mb-2">🔍</div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        No matching applications
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Try adjusting your search or filter.
      </p>
    </div>
  );
}
