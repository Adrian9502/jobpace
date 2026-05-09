"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG, FINAL_STAGES } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/utils";
import { deleteApplication } from "@/lib/actions";
import { importApplications } from "@/lib/actions/settings";
import { toast } from "sonner";
import StatusBadge from "./StatusBadge";
import StageBadge from "./StageBadge";
import PaginationBar from "./PaginationBar";
import ApplicationModal from "./ApplicationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Eye, MapPin, Plus, Search, Download, Upload, X, Check, Loader2, FileDown } from "lucide-react";
import Papa from "papaparse";
import { applicationsToCsv, generateCsvTemplate, validateCsvRows } from "@/lib/csv-helpers";
import type { ImportValidationResult } from "@/lib/csv-helpers";
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
  const [isViewMode, setIsViewMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  useEffect(() => {
    if (idFromUrl) {
      const app = applications.find((a) => a.id === idFromUrl);
      if (app) {
        setEditData(app);
        setIsViewMode(true);
        setShowModal(true);
      }
    }
  }, [idFromUrl, applications]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const isArchived = FINAL_STAGES.includes(app.stage as any);
      if (!showArchived && isArchived) return false;

      const matchesSearch =
        !search ||
        app.companyName.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase()) ||
        (app.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStage = stageFilter === "all" || app.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [applications, search, stageFilter, showArchived]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const router = useRouter();

  function openCreate() {
    setEditData(null);
    setIsViewMode(false);
    setShowModal(true);
  }
  function openEdit(app: ApplicationRow) {
    setEditData(app);
    setIsViewMode(false);
    setShowModal(true);
  }
  function openView(app: ApplicationRow) {
    setEditData(app);
    setIsViewMode(true);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditData(null);
    setIsViewMode(false);
    
    // Remove ?id from URL if present without triggering a refresh
    if (idFromUrl) {
      router.replace("/dashboard/applications", { scroll: false });
    }
  }

  // ─── CSV Export ───
  function handleExport() {
    const apps = applications.map((app) => ({
      ...app,
      dateApplied: new Date(app.dateApplied),
      followUpDate: app.followUpDate ? new Date(app.followUpDate) : null,
      interviewDate: app.interviewDate ? new Date(app.interviewDate) : null,
      createdAt: app.createdAt ? new Date(app.createdAt) : null,
      updatedAt: app.updatedAt ? new Date(app.updatedAt) : null,
    }));
    const csv = applicationsToCsv(apps as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobpace-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${applications.length} applications.`);
  }

  function handleDownloadTemplate() {
    const csv = generateCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobpace-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── CSV Import ───
  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large (max 2MB).");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rawRows = results.data as Record<string, string>[];
        const validation = validateCsvRows(rawRows, headers);
        setImportResult(validation);
        if (validation.validRows.length === 0 && validation.errors.length > 0) {
          toast.error("No valid rows found. Check the errors below.");
        }
      },
      error: () => {
        toast.error("Failed to parse the CSV file.");
      },
    });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleConfirmImport() {
    if (!importResult || importResult.validRows.length === 0) return;
    setImporting(true);
    const result = await importApplications(importResult.validRows);
    setImporting(false);
    if (result.success) {
      const msg = result.changes?.[0] || `Successfully imported ${importResult.validRows.length} applications!`;
      toast.success(msg);
      setImportResult(null);
      setShowImportModal(false);
    } else {
      toast.error(result.error || "Failed to import.");
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Job Applications
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={applications.length === 0}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            title="Import CSV"
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={openCreate}
            id="add-application-btn"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Add Application
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#97A0AF]" />
          <input
            type="text"
            placeholder="Search by company, position, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white dark:bg-zinc-900 transition-all"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => {
            setStageFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all min-w-40"
        >
          <option value="all">All Stages</option>
          {Object.entries(STAGE_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>
              {cfg.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 px-2 mt-2 sm:mt-0">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              setPage(1);
            }}
            className="w-3 h-3 sm:w-4 sm:h-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500/30"
          />
          Show Archived
        </label>
      </div>

      {/* Table / Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
          {applications.length === 0 ? (
            <>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 8h10M7 12h6M7 16h8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                No applications yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm mx-auto">
                Start tracking your job hunt! Add your first application to see
                it here.
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
                Add Your First Application
              </button>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                No matching applications
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Try adjusting your search or filter.
              </p>
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Company / Position
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Salary
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Stage
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Date Applied
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Source
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app, idx) => (
                  <tr
                    key={app.id}
                    className={`border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors ${idx % 2 === 0 ? "" : "bg-zinc-50/30 dark:bg-zinc-900/50"}`}
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
                          onClick={() => openView(app)}
                          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-4 h-4"
                          >
                            <path d="M1.5 8s3-4.5 6.5-4.5S14.5 8 14.5 8s-3 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="2" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEdit(app)}
                          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-4 h-4"
                          >
                            <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(app)}
                          className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="w-4 h-4"
                          >
                            <path d="M3.5 5h9M6 5V3.5h4V5M4.5 5l.5 8h6l.5-8" />
                          </svg>
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
              <div
                key={app.id}
                className="p-3 sm:p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {/* Top row: company/position + badges */}
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

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  {app.location && (
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{app.location}</span>
                      {app.workSetup && (
                        <span className="capitalize shrink-0">
                          · {app.workSetup}
                        </span>
                      )}
                    </div>
                  )}
                  <div>{formatDate(app.dateApplied)}</div>
                  {app.source && <div>{app.source}</div>}
                  <div>{formatSalary(app.salaryMin, app.salaryMax)}</div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openView(app)}
                    className="py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => openEdit(app)}
                    className="py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(app)}
                    className="py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPage={setPage}
          />
        </div>
      )}

      {/* Modals */}
      <ApplicationModal
        open={showModal}
        onClose={closeModal}
        editData={editData}
        readOnly={isViewMode}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Application"
          description="Are you sure you want to delete this application?"
          itemName={`${deleteTarget.position} at ${deleteTarget.companyName}`}
          onConfirm={async () => {
            const result = await deleteApplication(deleteTarget.id);
            if (result.success) {
              toast.success("Application deleted");
            } else {
              toast.error(result.error ?? "Failed to delete application.");
              throw new Error(result.error); // Propagate error to modal transition
            }
          }}
        />
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowImportModal(false);
              setImportResult(null);
            }}
          />
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Import Applications
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Upload a CSV file to bulk-add applications. Need the right format?{" "}
              <button
                onClick={handleDownloadTemplate}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Download template
              </button>
            </p>

            {/* Dropzone */}
            {!importResult && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                  {dragActive ? "Drop your CSV here" : "Click or drag a CSV file here"}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Max 2MB • .csv files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Validation Results */}
            {importResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {importResult.validRows.length} valid
                    </span>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {importResult.errors.length} error{importResult.errors.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
                      Skipped Rows:
                    </p>
                    <ul className="space-y-1">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-xs text-red-600 dark:text-red-400">
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing || importResult.validRows.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import {importResult.validRows.length} Application{importResult.validRows.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setImportResult(null)}
                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Re-upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
