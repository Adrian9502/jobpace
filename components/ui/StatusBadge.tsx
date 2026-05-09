import { STATUS_CONFIG } from "@/lib/constants";
import type { Status } from "@/lib/constants";

interface StatusBadgeProps {
  status?: string | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusCfg = status
    ? STATUS_CONFIG[status as Status] ?? STATUS_CONFIG.pending
    : null;

  if (!statusCfg) return <span className="text-zinc-400 dark:text-zinc-500 text-xs">—</span>;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
    >
      <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`} />
      {statusCfg.label}
    </span>
  );
}
