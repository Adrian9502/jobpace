import { Check } from "lucide-react";
import type { PasswordValidation } from "@/hooks/usePasswordValidation";

interface Props {
  validation: PasswordValidation;
}

const REQUIREMENTS = [
  { key: "length", label: "8+ characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "number", label: "One number" },
  { key: "lowercase", label: "Lowercase letter" },
] as const;

export default function PasswordRequirements({ validation }: Props) {
  return (
    <div className="mt-2 py-1.5">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {REQUIREMENTS.map(({ key, label }) => (
          <RequirementItem key={key} met={validation[key]} label={label} />
        ))}
      </div>
    </div>
  );
}

export function RequirementItem({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          met ? "bg-green-500" : "bg-gray-200 dark:bg-zinc-700"
        }`}
      >
        <Check
          size={8}
          stroke="white"
          strokeWidth={4}
          className={`transition-opacity ${met ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <span
        className={`text-xs transition-colors ${
          met
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-zinc-300"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
