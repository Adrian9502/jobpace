"use client";

// ──────────────────────────────────────────────
// Reusable pagination bar
// ──────────────────────────────────────────────

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

export default function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => {
      if (totalPages <= 7) return true;
      return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
    })
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (
        i > 0 &&
        typeof arr[i - 1] === "number" &&
        (p as number) - (arr[i - 1] as number) > 1
      ) {
        acc.push("…");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Showing{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          {total}
        </span>{" "}
        results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          ← Prev
        </button>

        {pageNums.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-xs text-zinc-400 dark:text-zinc-600"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`min-w-[30px] h-[30px] rounded-md text-xs font-medium transition-colors border ${
                page === p
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
