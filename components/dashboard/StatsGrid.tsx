import { Briefcase, CalendarDays, TrendingUp, Bell } from "lucide-react";

interface Props {
  total: number;
  interviews: number;
  offers: number;
  followUpsDue: number;
}

const stats = (data: Props) => [
  {
    label: "Total Applied",
    value: String(data.total),
    sub: "applications",
    colorClass: "text-zinc-900 dark:text-zinc-100",
    icon: <Briefcase className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />,
  },
  {
    label: "Interviews",
    value: String(data.interviews),
    sub: "scheduled",
    colorClass: "text-blue-600 dark:text-blue-400",
    icon: <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    label: "Offers",
    value: String(data.offers),
    sub: "received",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  {
    label: "Follow-ups Due",
    value: String(data.followUpsDue),
    sub: "this week",
    colorClass: "text-amber-600 dark:text-amber-400",
    href: "/dashboard/reminders",
    icon: <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  },
];

export default function StatsGrid({
  total,
  interviews,
  offers,
  followUpsDue,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats({ total, interviews, offers, followUpsDue }).map((stat) => {
        const card = (
          <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-4 py-3.5 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-1.5">
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {stat.label}
              </div>
              {stat.icon}
            </div>
            <div
              className={`text-2xl font-semibold mt-auto ${stat.colorClass}`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {stat.sub}
            </div>
          </div>
        );

        return stat.href ? (
          <a key={stat.label} href={stat.href} className="flex flex-col">
            {card}
          </a>
        ) : (
          <div key={stat.label} className="flex flex-col">
            {card}
          </div>
        );
      })}
    </div>
  );
}
