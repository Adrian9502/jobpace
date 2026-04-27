import { STAGE_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import type { Stage, Status } from "@/lib/constants";

interface StatusBadgeProps {
  stage: string;
  status?: string | null;
}

export default function StatusBadge({ stage, status }: StatusBadgeProps) {
  const stageCfg = STAGE_CONFIG[stage as Stage] ?? STAGE_CONFIG.applied;
  const statusCfg = status
    ? STATUS_CONFIG[status as Status] ?? STATUS_CONFIG.pending
    : null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Stage badge (primary) */}
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${stageCfg.bg} ${stageCfg.text} ${stageCfg.border}`}
      >
        {stageCfg.label}
      </span>
      {/* Status badge (secondary) */}
      {statusCfg && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}
        >
          <span className={`w-1 h-1 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      )}
    </div>
  );
}
