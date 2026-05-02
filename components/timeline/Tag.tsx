import { Globe, MapPin, Monitor, DollarSign } from "lucide-react";

type TagIcon = "source" | "pin" | "screen" | "money";

interface TagProps {
  children: React.ReactNode;
  icon: TagIcon;
  green?: boolean;
}

const ICONS: Record<TagIcon, React.ElementType> = {
  source: Globe,
  pin: MapPin,
  screen: Monitor,
  money: DollarSign,
};

export default function Tag({ children, icon, green }: TagProps) {
  const Icon = ICONS[icon];
  const base = green
    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
    : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${base}`}
    >
      <Icon className="w-3 h-3" />
      {children}
    </span>
  );
}
