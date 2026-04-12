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
  applied: { label: "Applied", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", headerBg: "bg-blue-100" },
  interview: { label: "Interview", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", headerBg: "bg-indigo-100" },
  exam: { label: "Exam", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", headerBg: "bg-purple-100" },
  offer: { label: "Offer", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", headerBg: "bg-emerald-100" },
  hired: { label: "Hired", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-600", headerBg: "bg-green-100" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", headerBg: "bg-red-100" },
  ghosted: { label: "Ghosted", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400", headerBg: "bg-gray-200" },
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
    return <div className="p-8 text-center text-[#5E6C84]">Loading board...</div>;
  }

  // Group applications by status
  const appsByStatus: Record<string, ApplicationRow[]> = {};
  KANBAN_COLUMNS.forEach((col) => {
    appsByStatus[col] = apps.filter((a) => a.status === col);
  });

  return (
    <>
      <div className="flex h-[calc(100vh-180px)] overflow-x-auto space-x-4 pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {KANBAN_COLUMNS.map((columnId) => {
            const cfg = STATUS_CONFIG[columnId];
            const columnApps = appsByStatus[columnId] || [];

            return (
              <div
                key={columnId}
                className="flex flex-col bg-[#F4F5F7] rounded-xl w-[280px] min-w-[280px] shrink-0 overflow-hidden shadow-sm border border-[#DFE1E6]"
              >
                {/* Column Header */}
                <div className={`px-4 py-3 flex items-center justify-between border-b border-[#DFE1E6] ${cfg.headerBg} bg-opacity-40`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <h3 className="font-semibold text-sm text-[#172B4D]">
                      {cfg.label}
                    </h3>
                  </div>
                  <span className="bg-white/60 text-[#5E6C84] text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
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
                      className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px] transition-all border-2 rounded-b-lg border-transparent ${
                        snapshot.isDraggingOver ? "bg-[#EBECF0] !border-[#0052CC]/30 border-dashed" : ""
                      }`}
                    >
                      {isEmpty && (!snapshot.isDraggingOver) && (
                        <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity absolute inset-0">
                          {/* Invisible placeholder to handle spacing, we want to rely on the background transitions */}
                        </div>
                      )}
                      {isEmpty && (
                        <div className="h-20 border-2 border-dashed border-[#DFE1E6] rounded-lg flex items-center justify-center text-[11px] text-[#5E6C84] bg-white/40">
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
                              className={`bg-white p-3.5 rounded-lg border border-[#DFE1E6] shadow-sm relative group transition-transform ${
                                snapshot.isDragging ? "rotate-2 shadow-md" : "hover:border-[#0052CC]/40"
                              }`}
                              style={provided.draggableProps.style}
                              onClick={(e) => {
                                // Default drag doesn't stop click event
                                setEditData(app);
                              }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm text-[#172B4D] truncate pr-4">
                                  {app.companyName}
                                </h4>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(app); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1 text-[#5E6C84] hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <path d="M3.5 5h9M6 5V3.5h4V5M4.5 5l.5 8h6l.5-8" />
                                  </svg>
                                </button>
                              </div>
                              <div className="text-xs text-[#5E6C84] truncate mb-3">{app.position}</div>

                              {app.source && (
                                <div className="mb-3 inline-block bg-[#F4F5F7] border border-[#DFE1E6] px-2 py-0.5 rounded text-[10px] font-medium text-[#5E6C84]">
                                  {app.source}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-[11px] text-[#5E6C84]">
                                <div className="flex items-center gap-1 bg-[#F4F5F7] px-1.5 py-0.5 rounded">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                                    <rect x="2" y="3" width="12" height="10" rx="1.5" />
                                    <path d="M2 6h12" />
                                  </svg>
                                  {new Date(app.dateApplied).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                                </div>
                                <div className="font-medium">
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
