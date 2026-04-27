"use client";

import { useState, useMemo, useEffect } from "react";
import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import PaginationBar from "./PaginationBar";
import ApplicationModal from "./ApplicationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Props {
  applications: ApplicationRow[];
}

const PAGE_SIZE = 10;

export default function ApplicationsClient({ applications }: Props) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<ApplicationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, stageFilter]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.companyName.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase()) ||
        (app.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStage = stageFilter === "all" || app.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [applications, search, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function openCreate() { setEditData(null); setShowModal(true); }
  function openEdit(app: ApplicationRow) { setEditData(app); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditData(null); }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Job Applications</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {applications.length} application{applications.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={openCreate} id="add-application-btn" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors shadow-sm">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M8 3v10M3 8h10" /></svg>
          Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg viewBox="0 0 16 16" fill="none" stroke="#97A0AF" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
            <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" />
          </svg>
          <input type="text" placeholder="Search by company, position, or location..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-900 transition-all" />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-[160px]">
          <option value="all">All Stages</option>
          {Object.entries(STAGE_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table / Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
          {applications.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 8h10M7 12h6M7 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No applications yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">Start tracking your job hunt! Add your first application to see it here.</p>
              <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M8 3v10M3 8h10" /></svg>
                Add Your First Application
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No matching applications</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your search or filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Company / Position</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Salary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Stage / Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date Applied</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Source</th>
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
                    <td className="px-4 py-3.5"><StatusBadge stage={app.stage} status={app.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100">{formatDate(app.dateApplied)}</td>
                    <td className="px-4 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">{app.source || "—"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(app)} className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(app)} className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
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
                  <StatusBadge stage={app.stage} status={app.status} />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  {app.location && (
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
                        <path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" /><circle cx="8" cy="6" r="1.5" />
                      </svg>
                      {app.location}{app.workSetup && <span className="capitalize"> · {app.workSetup}</span>}
                    </div>
                  )}
                  <div>{formatDate(app.dateApplied)}</div>
                  {app.source && <div>{app.source}</div>}
                  <div>{formatSalary(app.salaryMin, app.salaryMax)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(app)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">Edit</button>
                  <button onClick={() => setDeleteTarget(app)} className="flex-1 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>

          <PaginationBar page={safePage} totalPages={totalPages} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </div>
      )}

      <ApplicationModal open={showModal} onClose={closeModal} editData={editData} />
      {deleteTarget && (
        <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} applicationId={deleteTarget.id} companyName={deleteTarget.companyName} position={deleteTarget.position} />
      )}
    </>
  );
}
