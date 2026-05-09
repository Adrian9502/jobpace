import { ACTION_TYPES } from "@/lib/constants";

export default function ActionBadge({ actionType }: { actionType: string }) {
  const cfg = ACTION_TYPES[actionType] ?? ACTION_TYPES.UPDATE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}
