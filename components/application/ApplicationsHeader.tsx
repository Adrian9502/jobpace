import { Download, Upload, Plus } from "lucide-react";

interface Props {
  total: number;
  onExport: () => void;
  onImport: () => void;
  onAdd: () => void;
}

export default function ApplicationsHeader({
  total,
  onExport,
  onImport,
  onAdd,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Job Applications
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {total} application{total !== 1 ? "s" : ""} total
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          disabled={total === 0}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Export CSV"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button
          onClick={onImport}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          title="Import CSV"
        >
          <Upload className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button
          onClick={onAdd}
          id="add-application-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 shrink-0" />
          Add Application
        </button>
      </div>
    </div>
  );
}
