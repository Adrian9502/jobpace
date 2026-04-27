import { STAGE_CONFIG } from "@/lib/constants";
import type { Stage } from "@/lib/constants";

interface StageBadgeProps {
  stage: string;
}

export default function StageBadge({ stage }: StageBadgeProps) {
  const stageCfg = STAGE_CONFIG[stage as Stage] ?? STAGE_CONFIG.applied;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${stageCfg.bg} ${stageCfg.text} ${stageCfg.border}`}
    >
      {stageCfg.label}
    </span>
  );
}
