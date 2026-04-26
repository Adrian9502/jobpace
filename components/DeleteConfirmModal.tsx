"use client";

import { useTransition } from "react";
import { deleteApplication } from "@/lib/actions";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  companyName: string;
  position: string;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  applicationId,
  companyName,
  position,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteApplication(applicationId);
      if (result.success) {
        toast.success("Application deleted");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to delete application.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden animate-[modalIn_0.2s_ease-out]">
        <div className="px-6 py-5">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-red-500 dark:text-red-400">
              <path
                d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 text-center mb-1">
            Delete Application
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-1">
            Are you sure you want to delete this application?
          </p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-center">
            {position} at {companyName}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
