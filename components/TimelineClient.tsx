"use client";

import { useState } from "react";
import type { ApplicationRow } from "@/lib/actions";

const STATUS_FILTERS = [
  "All",
  "Applied",
  "Interview",
  "Exam",
  "Offer",
  "Hired",
  "Rejected",
  "Ghosted",
];

const COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  applied: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  interview: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  exam: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  offer: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
  hired: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-400", dot: "bg-green-600" },
  rejected: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  ghosted: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500 dark:text-zinc-400", dot: "bg-zinc-400" },
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => "₱" + (n / 1000).toFixed(0) + "k";
  if (min && max) return `${fmt(min)}-${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function getStatusNote(status: string, followUp: Date | null): string {
  switch (status) {
    case "applied":
      return followUp ? `Follow up on ${new Date(followUp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "Waiting for initial response";
    case "interview":
      return "Preparing for interview process";
    case "exam":
      return "Awaiting assessment results";
    case "offer":
      return "Offer received! Reviewing terms";
    case "hired":
      return "Offer accepted. Congratulations!";
    case "rejected":
      return "Application declined by company";
    case "ghosted":
      return "No response after 14 days";
    default:
      return "Tracking active";
  }
}

export default function TimelineClient({ applications }: { applications: ApplicationRow[] }) {
  const [filter, setFilter] = useState("All");

  const filteredApps = applications.filter((app) => 
    filter === "All" ? true : app.status === filter.toLowerCase()
  );

  // Group by Month-Year Example: "April 2026"
  const groupedApps: Record<string, ApplicationRow[]> = {};
  filteredApps.forEach((app) => {
    const d = new Date(app.dateApplied);
    const monthKey = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groupedApps[monthKey]) groupedApps[monthKey] = [];
    groupedApps[monthKey].push(app);
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === f
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-500 dark:text-zinc-400 shadow-sm">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">No applications found</p>
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">Try selecting a different status filter.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedApps).map(([monthKey, monthApps]) => (
            <div key={monthKey}>
              {/* Month Header */}
              <div className="sticky top-0 z-10 py-3 bg-zinc-50 dark:bg-zinc-950 transition-colors">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide">
                  {monthKey}
                </h3>
              </div>
              
              <div className="mt-4 relative space-y-6">
                {/* Structural spine (hidden on tight mobile, anchored left on desktop) */}
                <div className="absolute top-0 bottom-0 left-[66px] w-[2px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block rounded" />

                {monthApps.map((app) => {
                  const sc = COLORS[app.status] || COLORS.applied;
                  const dateStr = new Date(app.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const sal = formatSalary(app.salaryMin, app.salaryMax);

                  return (
                    <div key={app.id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start group">
                      
                      {/* Left Date (sm+) / Top Date (mobile) */}
                      <div className="sm:w-[48px] pt-1.5 shrink-0 sm:text-right hidden sm:block">
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">{dateStr.split(' ')[0]}</span>
                        <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-none">{dateStr.split(' ')[1]}</span>
                      </div>

                      {/* Timeline Node overlaying the line */}
                      <div className="relative z-10 sm:mt-1.5 hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-900 ring-4 ring-zinc-50 dark:ring-zinc-950 border border-zinc-200 dark:border-zinc-700">
                         <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 w-full relative">
                         {/* Mobile inline header for date/node */}
                         <div className="flex items-center gap-2 mb-2 sm:hidden pl-1">
                            <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{dateStr}</span>
                         </div>

                         <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2 gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
                                  {app.position}
                                </h4>
                                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  {app.companyName}
                                </div>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                                {app.status}
                              </span>
                           </div>
                           
                           {/* Row 2: Metadata Badges */}
                           <div className="flex flex-wrap gap-2 mt-4">
                              {app.source && (
                                <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded text-xs font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <path d="M8 2.5a5.5 5.5 0 011.5 10.8V12h-3v1.3A5.5 5.5 0 018 2.5z" />
                                  </svg>
                                  {app.source}
                                </span>
                              )}
                              
                              {app.location && (
                                <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded text-xs font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <path d="M8 2a4 4 0 00-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 00-4-4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                  {app.location}
                                </span>
                              )}

                              {app.workSetup && (
                                <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded text-xs font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <rect x="2" y="3" width="12" height="10" rx="2" />
                                    <path d="M8 1v2M5 13v2m6-2v2" />
                                  </svg>
                                  {app.workSetup.charAt(0).toUpperCase() + app.workSetup.slice(1)}
                                </span>
                              )}

                              {sal && (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                                    <path d="M2.5 8a5.5 5.5 0 0111 0v4a1 1 0 01-1 1h-9a1 1 0 01-1-1V8z" />
                                    <path d="M8 8v3" />
                                  </svg>
                                  {sal}
                                </span>
                              )}
                           </div>

                           {/* Status Note Footer */}
                           <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                             <svg viewBox="0 0 16 16" fill="currentColor" stroke="none" className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600">
                               <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm-.75 3.5h1.5v2h2v1.5h-2v2h-1.5v-2h-2v-1.5h2v-2z" />
                             </svg>
                             {getStatusNote(app.status, app.followUpDate)}
                           </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
