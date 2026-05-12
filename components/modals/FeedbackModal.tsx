"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitFeedback } from "@/app/actions/feedback";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState<
    "Bug" | "Feature Request" | "General"
  >("Feature Request");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }
    if (description.length > 500) {
      toast.error("Description cannot exceed 500 characters.");
      return;
    }

    startTransition(async () => {
      const result = await submitFeedback({ category, description });
      if (result.success) {
        toast.success("Feedback submitted! Thank you.");
        setDescription("");
        setCategory("Feature Request");
        onClose();
      } else {
        toast.error(result.error || "Failed to submit feedback.");
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Send Feedback
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col flex-1 overflow-y-auto"
        >
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
              disabled={isPending}
            >
              <option value="Feature Request">Feature Request</option>
              <option value="Bug">Bug Report</option>
              <option value="General">General Feedback</option>
            </select>
          </div>

          <div className="flex flex-col flex-1">
            <label
              htmlFor="description"
              className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              <span>Description</span>
              <span
                className={`text-xs ${description.length > 500 ? "text-red-500" : "text-zinc-500"}`}
              >
                {description.length} / 500
              </span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full flex-1 min-h-[120px] rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors resize-none"
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={
              isPending || description.length < 10 || description.length > 500
            }
            className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
