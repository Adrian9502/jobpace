"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG, STATUS_CONFIG, KANBAN_COLUMNS, KANBAN_HEADER_BG } from "@/lib/constants";
import type { Stage, Status } from "@/lib/constants";
import { formatSalaryCompact } from "@/lib/utils";
import { updateApplicationStage } from "@/lib/actions";
import ApplicationModal from "./ApplicationModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Props {
  initialApplications: ApplicationRow[];
}

// --- Sortable Item Component ---
function SortableAppCard({
  app,
  onEdit,
  onDelete,
  isOverlay = false,
}: {
  app: ApplicationRow;
  onEdit?: (app: ApplicationRow) => void;
  onDelete?: (app: ApplicationRow) => void;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { type: "Item", app } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const statusCfg = app.status ? STATUS_CONFIG[app.status as Status] ?? STATUS_CONFIG.pending : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-zinc-950 p-3.5 rounded-lg border shadow-sm relative group cursor-grab active:cursor-grabbing ${
        isOverlay ? "rotate-2 scale-105 shadow-xl border-blue-500/50" : isDragging ? "border-blue-500/50" : "border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40"
      }`}
      onClick={(e) => {
        if (onEdit) onEdit(app);
      }}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate pr-4">{app.companyName}</h4>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 p-1 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path d="M3.5 5h9M6 5V3.5h4V5M4.5 5l.5 8h6l.5-8" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-2">{app.position}</div>
      {/* Status badge */}
      {statusCfg && (
        <div className="mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
            <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      )}
      {app.source && (
        <div className="mb-2 inline-block bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-xs font-medium text-zinc-500 dark:text-zinc-400">
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
        <div className="font-medium text-zinc-700 dark:text-zinc-300">{formatSalaryCompact(app.salaryMin, app.salaryMax)}</div>
      </div>
    </div>
  );
}

// --- Column Component ---
function KanbanColumn({
  columnId,
  apps,
  onEdit,
  onDelete,
}: {
  columnId: string;
  apps: ApplicationRow[];
  onEdit: (app: ApplicationRow) => void;
  onDelete: (app: ApplicationRow) => void;
}) {
  const cfg = STAGE_CONFIG[columnId as Stage];
  const headerBg = KANBAN_HEADER_BG[columnId as Stage];

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "Column", columnId },
  });

  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl w-[260px] min-w-[260px] shrink-0 overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Column Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 ${headerBg} bg-opacity-40 dark:bg-opacity-20`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{cfg.label}</h3>
        </div>
        <span className="bg-white/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
          {apps.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-blue-500/20 dark:hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40">
        <div
          ref={setNodeRef}
          className={`p-3 space-y-3 min-h-[150px] transition-colors border-2 rounded-b-lg border-transparent ${
            isOver ? "bg-zinc-100 dark:bg-zinc-800/50 !border-blue-500/30 border-dashed" : ""
          }`}
        >
          <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {apps.map((app) => (
              <SortableAppCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </SortableContext>
          {apps.length === 0 && !isOver && (
            <div className="h-20 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 bg-white/40 dark:bg-zinc-900/40">
              Drop here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialApplications }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [apps, setApps] = useState<ApplicationRow[]>(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [editData, setEditData] = useState<ApplicationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRow | null>(null);

  // Sync state if props change (optional, but good for SSR freshness)
  useEffect(() => {
    setApps(initialApplications);
  }, [initialApplications]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // allows clicks to fire normally without triggering drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Item";
    const isOverTask = over.data.current?.type === "Item";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setApps((apps) => {
        const activeIndex = apps.findIndex((t) => t.id === activeId);
        const overIndex = apps.findIndex((t) => t.id === overId);

        if (apps[activeIndex].stage !== apps[overIndex].stage) {
          const newApps = [...apps];
          newApps[activeIndex] = { ...newApps[activeIndex], stage: apps[overIndex].stage };
          return arrayMove(newApps, activeIndex, overIndex);
        }
        return arrayMove(apps, activeIndex, overIndex);
      });
    }

    if (isActiveTask && isOverColumn) {
      setApps((apps) => {
        const activeIndex = apps.findIndex((t) => t.id === activeId);
        const newApps = [...apps];
        newApps[activeIndex] = { ...newApps[activeIndex], stage: overId as string };
        return arrayMove(newApps, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeApp = apps.find((a) => a.id === active.id);
    if (!activeApp) return;

    const oldStage = initialApplications.find((a) => a.id === active.id)?.stage;
    const newStage = activeApp.stage;

    if (oldStage !== newStage) {
      // Optimistic status update (nullify if final stage, else pending)
      setApps((prev) =>
        prev.map((a) => (a.id === active.id ? { ...a, status: ["hired", "rejected", "ghosted", "withdrawn"].includes(newStage as string) ? null : "pending" } : a))
      );

      // Confetti!
      if (newStage === "hired") {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      }

      const res = await updateApplicationStage(active.id as string, newStage);
      if (!res.success) {
        toast.error("Failed to update stage");
        setApps(initialApplications);
      } else {
        if (res.changes) {
          res.changes.forEach((c) => toast.success(c));
        }
      }
    }
  };

  const activeApp = useMemo(
    () => apps.find((a) => a.id === activeId),
    [activeId, apps]
  );

  if (!mounted) {
    return <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Loading board...</div>;
  }

  const appsByStage: Record<string, ApplicationRow[]> = {};
  KANBAN_COLUMNS.forEach((col) => {
    appsByStage[col] = apps.filter((a) => a.stage === col);
  });

  return (
    <>
      <div className="flex h-[calc(100vh-180px)] overflow-x-auto space-x-4 pb-4 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/70 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-blue-500/30 dark:hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50 transition-colors">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {KANBAN_COLUMNS.map((columnId) => (
            <KanbanColumn
              key={columnId}
              columnId={columnId}
              apps={appsByStage[columnId] || []}
              onEdit={setEditData}
              onDelete={setDeleteTarget}
            />
          ))}

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
            }}
          >
            {activeApp ? <SortableAppCard app={activeApp} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ApplicationModal open={!!editData} onClose={() => setEditData(null)} editData={editData} />
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
