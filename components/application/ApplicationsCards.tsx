import { Eye, MapPin, Pencil, Trash2 } from "lucide-react";
import { formatDate, formatSalary } from "@/lib/utils";
import StageBadge from "@/components/ui/StageBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import type { ApplicationRow } from "@/lib/queries";

interface Props {
  applications: ApplicationRow[];
  onView: (app: ApplicationRow) => void;
  onEdit: (app: ApplicationRow) => void;
  onDelete: (app: ApplicationRow) => void;
}

export default function ApplicationsCards({
  applications,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
      {applications.map((app) => (
        <div
          key={app.id}
          className="p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {app.companyName}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {app.position}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StageBadge stage={app.stage} />
              <StatusBadge status={app.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            {app.location && (
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{app.location}</span>
                {app.workSetup && (
                  <span className="capitalize shrink-0">· {app.workSetup}</span>
                )}
              </div>
            )}
            <div>{formatDate(app.dateApplied)}</div>
            {app.source && <div>{app.source}</div>}
            <div>{formatSalary(app.salaryMin, app.salaryMax)}</div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
            <button
              onClick={() => onView(app)}
              className="py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              View
            </button>
            <button
              onClick={() => onEdit(app)}
              className="py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              Edit
            </button>
            <button
              onClick={() => onDelete(app)}
              className="py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
