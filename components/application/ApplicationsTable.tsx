import { Eye, Pencil, Trash2 } from "lucide-react";
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

export default function ApplicationsTable({
  applications,
  onView,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
            {[
              "Company / Position",
              "Location",
              "Salary",
              "Stage",
              "Status",
              "Date Applied",
              "Source",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide ${h === "Actions" ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map((app, idx) => (
            <tr
              key={app.id}
              className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${
                idx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"
              }`}
            >
              <td className="px-4 py-3.5">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {app.companyName}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {app.position}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="text-sm text-zinc-900 dark:text-zinc-100">
                  {app.location || "—"}
                </div>
                {app.workSetup && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 capitalize mt-0.5">
                    {app.workSetup}
                  </div>
                )}
              </td>
              <td className="px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">
                {formatSalary(app.salaryMin, app.salaryMax)}
              </td>
              <td className="px-4 py-3.5">
                <StageBadge stage={app.stage} />
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">
                {formatDate(app.dateApplied)}
              </td>
              <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">
                {app.source || "—"}
              </td>
              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(app)}
                    className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(app)}
                    className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
