"use client";

import { useState } from "react";
import { formatDateTime, formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  FileText,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface SerializedUpcoming {
  id: string;
  type: "interview" | "follow_up" | "stale";
  title: string;
  companyName: string;
  position: string;
  date: string;
  applicationId: string;
  isActive: boolean;
}

interface SerializedHistory {
  id: string;
  type: string;
  sentAt: string | null;
  applicationId: string | null;
  companyName?: string;
  position?: string;
}

interface Props {
  upcoming: SerializedUpcoming[];
  history: SerializedHistory[];
}

export default function RemindersClient({ upcoming, history }: Props) {
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "history">(
    "active",
  );
  const [filter, setFilter] = useState<
    "all" | "interview" | "follow_up" | "stale"
  >("all");

  const activeReminders = upcoming.filter((item) => item.isActive);
  const futureReminders = upcoming.filter((item) => !item.isActive);

  const filteredActive = activeReminders.filter(
    (item) => filter === "all" || item.type === filter,
  );

  const filteredUpcoming = futureReminders.filter(
    (item) => filter === "all" || item.type === filter,
  );

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    if (filter === "interview") return item.type === "interview_reminder";
    if (filter === "follow_up") return item.type === "follow_up_reminder";
    if (filter === "stale") return item.type === "stale_application_reminder";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2.5 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          Active Reminders
          {activeReminders.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeReminders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2.5 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
            activeTab === "upcoming"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          Upcoming Reminders
          {futureReminders.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {futureReminders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          Notification History
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "interview", "follow_up", "stale"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === f
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {f === "all" && "All"}
            {f === "interview" && "Interviews"}
            {f === "follow_up" && "Follow-ups"}
            {f === "stale" && "Stale Applications"}
          </button>
        ))}
      </div>

      {/* Active Reminders Tab */}
      {activeTab === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActive.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                You're all caught up!
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                No past due follow-ups, stale applications, or action items
                right now.
              </p>
            </div>
          ) : (
            filteredActive.map((item) => (
              <ReminderCard key={item.id} reminder={item} />
            ))
          )}
        </div>
      )}

      {/* Upcoming Reminders Tab */}
      {activeTab === "upcoming" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUpcoming.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center shadow-sm">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No upcoming reminders
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                You have no upcoming interviews or follow-ups scheduled for the
                future.
              </p>
            </div>
          ) : (
            filteredUpcoming.map((item) => (
              <ReminderCard key={item.id} reminder={item} />
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No history yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                When the system sends you automated reminders, they will appear
                here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredHistory.map((item) => (
                <li
                  key={item.id}
                  className="p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <HistoryIcon type={item.type} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {getHistoryTitle(item.type)}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.companyName} • {item.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 sm:self-start">
                      <Clock className="w-3.5 h-3.5" />
                      {item.sentAt
                        ? formatDateTime(item.sentAt)
                        : "Unknown date"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers & Sub-components
// ──────────────────────────────────────────────

function ReminderCard({ reminder }: { reminder: SerializedUpcoming }) {
  const isStale = reminder.type === "stale";
  const isInterview = reminder.type === "interview";

  const icon = isInterview ? (
    <CalendarDays className="w-5 h-5" />
  ) : isStale ? (
    <AlertTriangle className="w-5 h-5" />
  ) : (
    <Clock className="w-5 h-5" />
  );

  const bgColor = isInterview
    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
    : isStale
      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-lg ${bgColor}`}>{icon}</div>
          <span className="text-xs font-semibold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
            {formatDate(reminder.date)}
          </span>
        </div>

        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {reminder.title}
        </h3>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {reminder.companyName}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
          {reminder.position}
        </p>

        {isStale && (
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            No update for 20+ days
          </p>
        )}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-800/20">
        <Link
          href={`/dashboard/applications?id=${reminder.applicationId}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          View Application
        </Link>
      </div>
    </div>
  );
}

function HistoryIcon({ type }: { type: string }) {
  if (type === "interview_reminder") {
    return (
      <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md">
        <CalendarDays className="w-4 h-4" />
      </div>
    );
  }
  if (type === "stale_application_reminder") {
    return (
      <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md">
        <AlertTriangle className="w-4 h-4" />
      </div>
    );
  }
  return (
    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
      <Mail className="w-4 h-4" />
    </div>
  );
}

function getHistoryTitle(type: string) {
  switch (type) {
    case "interview_reminder":
      return "Interview Reminder Sent";
    case "follow_up_reminder":
      return "Follow-up Reminder Sent";
    case "stale_application_reminder":
      return "Stale Application Alert Sent";
    default:
      return "Notification Sent";
  }
}
