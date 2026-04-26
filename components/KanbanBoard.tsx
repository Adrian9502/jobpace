"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { ApplicationRow } from "@/lib/actions";
import { updateApplicationStatus } from "@/lib/actions";
import ApplicationModal from "./ApplicationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const KANBAN_COLUMNS = [
  "applied",
  "interview",
  "exam",
  "offer",
  "hired",
  "rejected",
  "ghosted",
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; headerBg: string }> = {
  applied: { label: "Applied", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", headerBg: "bg-blue-100 dark:bg-blue-900/30" },
  interview: { label: "Interview", bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500", headerBg: "bg-indigo-100 dark:bg-indigo-900/30" },
  exam: { label: "Exam", bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500", headerBg: "bg-purple-100 dark:bg-purple-900/30" },
  offer: { label: "Offer", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", headerBg: "bg-emerald-100 dark:bg-emerald-900/30" },
  hired: { label: "Hired", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", dot: "bg-green-600", headerBg: "bg-green-100 dark:bg-green-900/30" },
  rejected: { label: "Rejected", bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500", headerBg: "bg-red-100 dark:bg-red-900/30" },
  ghosted: { label: "Ghosted", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500 dark:text-zinc-400", dot: "bg-zinc-400", headerBg: "bg-zinc-200 dark:bg-zinc-800" },
};

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => "₱" + (n / 1000).toFixed(0) + "k";
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

interface Props {
  initialApplications: ApplicationRow[];
}

export default function KanbanBoard({ initialApplications }: Props) {
  // 1. Client-side safeguard to avoid hydration mismatch with dnd
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 2. Local state for optimistic UI
  const [apps, setApps] = useState<ApplicationRow[]>(initialApplications);
  
  // Update local state if props change (e.g., from server revalidation)
  useEffect(() => {
    setApps(initialApplications);
  }, [initialApplications]);

  // Modals state
  const [editData, setEditData] = useState<ApplicationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a valid droppable
      if (!destination) return;

      // Dropped in the same place
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const draggedApp = apps.find((a) => a.id === draggableId);
      if (!draggedApp) return;

      const oldStatus = source.droppableId;
      const newStatus = destination.droppableId;

      // Optimistically update
      setApps((prevApps) => {
        const newApps = [...prevApps];
        const idx = newApps.findIndex((a) => a.id === draggableId);
        if (idx !== -1) {
          // We don't guarantee strict ordering within columns right now 
          // to keep it simple, but we update the status.
          newApps[idx] = { ...newApps[idx], status: newStatus };
        }
        return newApps;
      });

      // Call server to persist
      if (oldStatus !== newStatus) {
        const res = await updateApplicationStatus(draggableId, newStatus);
        if (!res.success) {
          // Revert on fail
          console.error("Failed to update status:", res.error);
          toast.error("Failed to update status");
          setApps(initialApplications);
        } else {
          if (res.changes) {
            res.changes.forEach(c => toast.success(c));
          }
        }
      }
    },
    [apps, initialApplications]
  );

  if (!mounted) {
    return <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Loading board...</div>;
  }

  // Group applications by status
  const appsByStatus: Record<string, ApplicationRow[]> = {};
  KANBAN_COLUMNS.forEach((col) => {
    appsByStatus[col] = apps.filter((a) => a.status === col);
  });

  return (
    <>
      <div className="flex h-[calc(100vh-180px)] overflow-x-auto space-x-4 pb-4 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/70 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-blue-500/30 dark:hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50 transition-colors">
        <DragDropContext onDragEnd={onDragEnd}>
          {KANBAN_COLUMNS.map((columnId) => {
            const cfg = STATUS_CONFIG[columnId];
            const columnApps = appsByStatus[columnId] || [];

            return (
              <div
                key={columnId}
                className="flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl w-[280px] min-w-[280px] shrink-0 overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors"
              >
                {/* Column Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 ${cfg.headerBg} bg-opacity-40 dark:bg-opacity-20`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {cfg.label}
                    </h3>
                  </div>
                  <span className="bg-white/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    {columnApps.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => {
                    const isEmpty = columnApps.length === 0;
                    const showDropHint = isEmpty || snapshot.isDraggingOver;
                    
                    return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] transition-all border-2 rounded-b-lg border-transparent [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-blue-500/20 dark:hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40 ${
                        snapshot.isDraggingOver ? "bg-zinc-100 dark:bg-zinc-800/50 !border-blue-500/30 border-dashed" : ""
                      }`}
                    >
                      {isEmpty && (!snapshot.isDraggingOver) && (
                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity absolute inset-0">
                          {/* Invisible placeholder to handle spacing, we want to rely on the background transitions */}
                        </div>
                      )}
                      {isEmpty && (
                        <div className="h-20 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/40 dark:bg-zinc-900/40">
                          Drop here
                        </div>
                      )}
                      {columnApps.map((app, index) => (
                        <Draggable
                          key={app.id}
                          draggableId={app.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-zinc-950 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm relative group transition-transform ${
                                snapshot.isDragging ? "rotate-2 shadow-md border-blue-500/50" : "hover:border-blue-500/40"
                              }`}
                              style={provided.draggableProps.style}
                              onClick={(e) => {
                                // Default drag doesn't stop click event
                                setEditData(app);
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate pr-4">
                                  {app.companyName}
                                </h4>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(app); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Delete"
                                >
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <path d="M3.5 5h9M6 5V3.5h4V5M4.5 5l.5 8h6l.5-8" />
                                  </svg>
                                </button>
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-3">{app.position}</div>

                              {app.source && (
                                <div className="mb-3 inline-block bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                  {app.source}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-1.5 py-0.5 rounded">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                                    <rect x="2" y="3" width="12" height="10" rx="1.5" />
                                    <path d="M2 6h12" />
                                  </svg>
                                  {new Date(app.dateApplied).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                                </div>
                                <div className="font-medium text-zinc-700 dark:text-zinc-300">
                                  {formatSalary(app.salaryMin, app.salaryMax)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>

      {/* Reused Modals */}
      <ApplicationModal
        open={!!editData}
        onClose={() => setEditData(null)}
        editData={editData}
      />
      
      {deleteTarget && (
        <DeleteConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          applicationId={deleteTarget.id}
          companyName={deleteTarget.companyName}
          position={deleteTarget.position}
        />
      )}
    </>
  );
}
