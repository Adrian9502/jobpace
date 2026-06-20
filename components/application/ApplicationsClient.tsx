"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { ApplicationRow } from "@/lib/queries";
import { FINAL_STAGES } from "@/lib/constants";
import { deleteApplication } from "@/lib/actions";
import { applicationsToCsv } from "@/lib/csv-helpers";
import { toast } from "sonner";
import PaginationBar from "@/components/ui/PaginationBar";
import ApplicationModal from "@/components/modals/ApplicationModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import ApplicationsHeader from "./ApplicationsHeader";
import ApplicationsFilters from "./ApplicationsFilters";
import ApplicationsTable from "./ApplicationsTable";
import ApplicationsCards from "./ApplicationsCards";
import ApplicationsEmptyState from "./ApplicationsEmptyState";
import ImportCsvModal from "./ImportCsvModal";

const PAGE_SIZE = 10;

export default function ApplicationsClient({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<ApplicationRow | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const idFromUrl = searchParams.get("id");
  const editFromUrl = searchParams.get("edit");

  useEffect(() => {
    if (idFromUrl) {
      const app = applications.find((a) => a.id === idFromUrl);
      if (app) {
        setEditData(app);
        setIsViewMode(editFromUrl !== "true");
        setShowModal(true);
      }
    }
  }, [idFromUrl, editFromUrl, applications]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const isArchived = FINAL_STAGES.includes(app.stage as any);
      if (!showArchived && isArchived) return false;
      const matchesSearch =
        !search ||
        app.companyName.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase()) ||
        (app.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return (
        matchesSearch && (stageFilter === "all" || app.stage === stageFilter)
      );
    });
  }, [applications, search, stageFilter, showArchived]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

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
    if (idFromUrl) router.replace("/dashboard/applications", { scroll: false });
  }

  function handleExport() {
    const csv = applicationsToCsv(
      applications.map((app) => ({
        ...app,
        dateApplied: new Date(app.dateApplied),
        followUpDate: app.followUpDate ? new Date(app.followUpDate) : null,
        interviewDate: app.interviewDate ? new Date(app.interviewDate) : null,
        createdAt: app.createdAt ? new Date(app.createdAt) : null,
        updatedAt: app.updatedAt ? new Date(app.updatedAt) : null,
      })) as any,
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobpace-applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${applications.length} applications.`);
  }

  return (
    <>
      <ApplicationsHeader
        total={applications.length}
        onExport={handleExport}
        onImport={() => setShowImportModal(true)}
        onAdd={openCreate}
      />
      <ApplicationsFilters
        search={search}
        stageFilter={stageFilter}
        showArchived={showArchived}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onStageFilter={(v) => {
          setStageFilter(v);
          setPage(1);
        }}
        onShowArchived={(v) => {
          setShowArchived(v);
          setPage(1);
        }}
      />

      {filtered.length === 0 ? (
        <ApplicationsEmptyState
          hasApplications={applications.length > 0}
          onAdd={openCreate}
        />
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <ApplicationsTable
            applications={paginated}
            onView={openView}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <ApplicationsCards
            applications={paginated}
            onView={openView}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPage={setPage}
          />
        </div>
      )}

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
              toast.error(result.error ?? "Failed to delete.");
              throw new Error(result.error);
            }
          }}
        />
      )}

      {showImportModal && (
        <ImportCsvModal onClose={() => setShowImportModal(false)} />
      )}
    </>
  );
}
