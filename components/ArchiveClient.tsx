"use client";

import { useState, useMemo, useEffect } from "react";
import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG, FINAL_STAGES } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/utils";
import { deleteApplication } from "@/lib/actions";
import { toast } from "sonner";
import StatusBadge from "./StatusBadge";
import StageBadge from "./StageBadge";
import PaginationBar from "./PaginationBar";
import ApplicationModal from "./ApplicationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Props {
  applications: ApplicationRow[];
}

const PAGE_SIZE = 10;

export default function ArchiveClient({ applications }: Props) {
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [viewData, setViewData] = useState<ApplicationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);
  const [page, setPage] = useState(1);

  // Filter only archived applications
  const archivedApps = useMemo(() => {
    return applications.filter((app) => FINAL_STAGES.includes(app.stage as any));
  }, [applications]);

  useEffect(() => { setPage(1); }, [search, outcomeFilter]);

  const filtered = useMemo(() => {
    return archivedApps.filter((app) => {
      const matchesSearch =
        !search ||
        app.companyName.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase()) ||
        (app.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesOutcome = outcomeFilter === "all" || app.stage === outcomeFilter;
      return matchesSearch && matchesOutcome;
    });
  }, [archivedApps, search, outcomeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function openView(app: ApplicationRow) { setViewData(app); setShowModal(true); }
  function closeModal() { setShowModal(false); setViewData(null); }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Application Archive</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {archivedApps.length} completed application{archivedApps.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg viewBox="0 0 16 16" fill="none" stroke="#97A0AF" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
          </svg>
          <input type="text" placeholder="Search archive by company, position, or location..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-900 transition-all" />
        </div>
        <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
          className="px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-[160px]">
          <option value="all">All Outcomes</option>
          {FINAL_STAGES.map((stage) => (
            <option key={stage} value={stage}>{STAGE_CONFIG[stage].label}</option>
          ))}
        </select>
      </div>

      {/* Table / Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-zinc-400 dark:text-zinc-500">
              <path d="M2.5 3h11v2h-11zM3.5 5v8a1 1 0 001 1h7a1 1 0 001-1V5" />
              <path d="M6 8h4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Archive is empty</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
            Applications will automatically appear here once they reach a final outcome.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Company / Position</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Salary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date Applied</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app, idx) => (
                  <tr key={app.id} className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${idx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"}`}>
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{app.companyName}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{app.position}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-zinc-900 dark:text-zinc-100">{app.location || "—"}</div>
                      {app.workSetup && <div className="text-xs text-zinc-500 dark:text-zinc-400 capitalize mt-0.5">{app.workSetup}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">{formatSalary(app.salaryMin, app.salaryMax)}</td>
                    <td className="px-4 py-3.5"><StageBadge stage={app.stage} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">{formatDate(app.dateApplied)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(app)} className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View Details">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M1.5 8s3-4.5 6.5-4.5S14.5 8 14.5 8s-3 4.5-6.5 4.5S1.5 8 1.5 8z" /><circle cx="8" cy="8" r="2" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(app)} className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete from Archive">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M3.5 5h9M6 5V3.5h4V5M4.5 5l.5 8h6l.5-8" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {paginated.map((app) => (
              <div key={app.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{app.companyName}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{app.position}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StageBadge stage={app.stage} />
                    <StatusBadge status={app.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Applied</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{formatDate(app.dateApplied)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Location</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{app.location || "—"}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button onClick={() => openView(app)} className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex-1 text-center flex items-center justify-center gap-1.5">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M1.5 8s3-4.5 6.5-4.5S14.5 8 14.5 8s-3 4.5-6.5 4.5S1.5 8 1.5 8z" /><circle cx="8" cy="8" r="2" /></svg>
                    View
                  </button>
                  <button onClick={() => setDeleteTarget(app)} className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <PaginationBar page={page} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </div>
      )}

      {/* Modals */}
      <ApplicationModal open={showModal} onClose={closeModal} editData={viewData} readOnly={true} />
      {deleteTarget && (
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete from Archive"
          description="Are you sure you want to delete this application? This action cannot be undone."
          itemName={`${deleteTarget.position} at ${deleteTarget.companyName}`}
          onConfirm={async () => {
            const result = await deleteApplication(deleteTarget.id);
            if (result.success) {
              toast.success("Application deleted");
            } else {
              toast.error(result.error ?? "Failed to delete application.");
              throw new Error(result.error);
            }
          }}
        />
      )}

    </>
  );
}
