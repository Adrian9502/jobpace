import type { PasswordValidation } from "@/hooks/usePasswordValidation";

interface Props {
  validation: PasswordValidation;
}

const REQUIREMENTS = [
  { key: "length",    label: "8+ characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "number",    label: "One number" },
  { key: "lowercase", label: "Lowercase letter" },
] as const;

export default function PasswordRequirements({ validation }: Props) {
  return (
    <div className="mt-2 p-2.5 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700/50">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {REQUIREMENTS.map(({ key, label }) => (
          <RequirementItem key={key} met={validation[key]} label={label} />
        ))}
      </div>
    </div>
  );
}

export function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        met ? "bg-green-500" : "bg-gray-200 dark:bg-zinc-700"
      }`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"
          className={`w-2 h-2 transition-opacity ${met ? "opacity-100" : "opacity-0"}`}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className={`text-xs transition-colors ${
        met
          ? "text-green-600 dark:text-green-400"
          : "text-gray-400 dark:text-zinc-500"
      }`}>
        {label}
      </span>
    </div>
  );
}