import { STAGE_CONFIG, STATUS_CONFIG } from "@/lib/constants";

export default function ValueChip({
  value,
  field,
}: {
  value: string;
  field: string;
}) {
  const normalized = value.toLowerCase().trim();

  if (field === "Stage") {
    const cfg =
      Object.values(STAGE_CONFIG).find(
        (c) => c.label.toLowerCase() === normalized,
      ) || (STAGE_CONFIG as any)[normalized];
    if (cfg) {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>
      );
    }
  }

  if (field === "Status") {
    const cfg =
      Object.values(STATUS_CONFIG).find(
        (c) => c.label.toLowerCase() === normalized,
      ) || (STATUS_CONFIG as any)[normalized];
    if (cfg) {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>
      );
    }
  }

  return (
    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
      {value}
    </span>
  );
}
