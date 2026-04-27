"use client";

import { useMemo } from "react";
import type { ApplicationRow } from "@/lib/queries";
import { STAGE_CONFIG, FINAL_STAGES } from "@/lib/constants";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface Props {
  applications: ApplicationRow[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-lg text-sm text-zinc-900 dark:text-zinc-100">
        <p className="font-semibold mb-1">{label || payload[0].name}</p>
        {payload.map((p: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload.fill || p.stroke }} />
            <span className="text-zinc-600 dark:text-zinc-400">{p.name === "value" ? "Value" : p.name}:</span>
            <span className="font-medium">{p.value}{p.unit || ""}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ applications }: Props) {
  // 1. Key Metrics Calculation
  const metrics = useMemo(() => {
    const total = applications.length;
    if (total === 0) return null;

    const interviews = applications.filter(a => ["interview", "assessment", "final_interview", "offer", "hired"].includes(a.stage)).length;
    const offers = applications.filter(a => ["offer", "hired"].includes(a.stage)).length;
    const hired = applications.filter(a => a.stage === "hired").length;
    const active = applications.filter(a => !["rejected", "ghosted", "withdrawn", "hired"].includes(a.stage)).length;
    
    const stagnantCount = applications.filter(a => {
      if (["rejected", "ghosted", "withdrawn", "hired"].includes(a.stage)) return false;
      const lastUpdate = new Date(a.updatedAt || a.dateApplied).getTime();
      const fourteenDaysAgo = new Date().getTime() - (14 * 24 * 60 * 60 * 1000);
      return lastUpdate < fourteenDaysAgo;
    }).length;

    // Avg time to offer (for hired apps)
    const hiredApps = applications.filter(a => a.stage === "hired" && a.dateApplied);
    const avgTimeToHire = hiredApps.length > 0 
      ? Math.round(hiredApps.reduce((acc, app) => {
          const start = new Date(app.dateApplied).getTime();
          const end = new Date(app.updatedAt || new Date()).getTime();
          return acc + (end - start);
        }, 0) / hiredApps.length / (24 * 60 * 60 * 1000))
      : 0;

    return {
      total,
      interviewRate: ((interviews / total) * 100).toFixed(1),
      offerRate: ((offers / total) * 100).toFixed(1),
      hiredCount: hired,
      activeCount: active,
      stagnantCount,
      avgTimeToHire
    };
  }, [applications]);

  // 2. Weekly Trends (Last 8 Weeks)
  const weeklyTrends = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
      // Find the Monday of that week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      weeks[label] = 0;
    }

    applications.forEach(app => {
      const d = new Date(app.dateApplied);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const label = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      if (weeks[label] !== undefined) weeks[label]++;
    });

    return Object.entries(weeks).map(([name, count]) => ({ name, Applications: count }));
  }, [applications]);

  // 3. Conversion Funnel (Upgraded with Percentages)
  const funnelData = useMemo(() => {
    const total = applications.length;
    const screening = applications.filter(a => !["applied"].includes(a.stage)).length;
    const interviews = applications.filter(a => ["interview", "assessment", "final_interview", "offer", "hired"].includes(a.stage)).length;
    const offers = applications.filter(a => ["offer", "hired"].includes(a.stage)).length;
    const hired = applications.filter(a => a.stage === "hired").length;

    return [
      { name: "Applied", value: total, percentage: "100%", fill: "#3b82f6" },
      { name: "Screening", value: screening, percentage: total ? `${Math.round((screening / total) * 100)}%` : "0%", fill: "#0ea5e9" },
      { name: "Interview", value: interviews, percentage: total ? `${Math.round((interviews / total) * 100)}%` : "0%", fill: "#8b5cf6" },
      { name: "Offer", value: offers, percentage: total ? `${Math.round((offers / total) * 100)}%` : "0%", fill: "#f59e0b" },
      { name: "Hired", value: hired, percentage: total ? `${Math.round((hired / total) * 100)}%` : "0%", fill: "#10b981" },
    ];
  }, [applications]);

  // 4. Time to Stage (Averages)
  const timeToStageData = useMemo(() => {
    const stages = ["screening", "interview", "offer", "hired"];
    return stages.map(s => {
      const apps = applications.filter(a => a.stage === s || (s === "interview" && ["assessment", "final_interview"].includes(a.stage)));
      const avgDays = apps.length > 0
        ? Math.round(apps.reduce((acc, a) => {
            const start = new Date(a.dateApplied).getTime();
            const end = new Date(a.updatedAt || new Date()).getTime();
            return acc + (end - start);
          }, 0) / apps.length / (24 * 60 * 60 * 1000))
        : 0;
      
      return {
        name: STAGE_CONFIG[s as keyof typeof STAGE_CONFIG]?.label || s,
        Days: avgDays
      };
    }).filter(d => d.Days > 0);
  }, [applications]);

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b", "#10b981", "#0ea5e9", "#64748b"];

  if (applications.length === 0 || !metrics) return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
      <p className="text-4xl mb-4">📊</p>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No data to analyze yet</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">
        Add some job applications to see your personal career analytics here.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Applications", value: metrics.total, color: "text-zinc-900 dark:text-white" },
          { label: "Active", value: metrics.activeCount, color: "text-blue-600 dark:text-blue-400" },
          { label: "Interview Rate", value: `${metrics.interviewRate}%`, color: "text-purple-600 dark:text-purple-400" },
          { label: "Offer Rate", value: `${metrics.offerRate}%`, color: "text-amber-600 dark:text-amber-400" },
          { label: "Stagnant", value: metrics.stagnantCount, color: metrics.stagnantCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-500", sub: "> 14 days" },
          { label: "Avg. Days to Hire", value: metrics.avgTimeToHire, color: "text-emerald-600 dark:text-emerald-400", sub: "days" },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{m.label}</p>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            {m.sub && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{m.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Line Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Weekly Application Growth
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Applications" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upgraded Conversion Funnel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Conversion Pipeline (%)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ top: 0, right: 50, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#52525b" strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }} dx={-10} />
                <Tooltip cursor={{ fill: '#71717a', opacity: 0.05 }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                {/* Labels for percentages */}
                <Legend content={() => null} />
                {funnelData.map((entry, index) => (
                  <text key={index} x={0} y={0} /> // Placeholder to avoid error
                ))}
              </BarChart>
            </ResponsiveContainer>
            {/* Custom overlays for percentages since Recharts LabelList can be tricky with vertical bars */}
            <div className="mt-[-280px] h-[280px] pointer-events-none relative">
              {funnelData.map((entry, i) => (
                <div key={i} className="absolute right-0 text-[10px] font-bold text-zinc-500 dark:text-zinc-400" style={{ top: `${(i * 20) + 10}%`, transform: 'translateY(-50%)' }}>
                  {entry.percentage}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time to Stage Metrics */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Avg. Days to Reach Stage
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeToStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} unit="d" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Days" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Effectiveness (Keep existing but polish) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Top Sources (Conversion)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={applications.reduce((acc: any[], app) => {
                  if (!app.source) return acc;
                  let existing = acc.find(x => x.name === app.source);
                  if (!existing) {
                    existing = { name: app.source, Total: 0, Success: 0 };
                    acc.push(existing);
                  }
                  existing.Total++;
                  if (!["applied", "screening", "rejected", "ghosted"].includes(app.stage)) existing.Success++;
                  return acc;
                }, []).sort((a, b) => b.Total - a.Total).slice(0, 5)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52525b" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#71717a', opacity: 0.05 }} content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingBottom: '20px' }} />
                <Bar dataKey="Total" name="Applications" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={25} />
                <Bar dataKey="Success" name="Interviews+" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
