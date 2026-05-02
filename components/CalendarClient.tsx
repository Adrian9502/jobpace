"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  User,
  Mail,
  X,
} from "lucide-react";
import type { ApplicationRow } from "@/lib/queries";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationModal from "./ApplicationModal";

interface Props {
  applications: ApplicationRow[];
}

export default function CalendarClient({ applications }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);

  const interviews = useMemo(
    () => applications.filter((app) => app.interviewDate !== null),
    [applications],
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  const selectedInterviews = useMemo(() => {
    if (!selectedDate) return [];
    return interviews.filter((app) =>
      isSameDay(new Date(app.interviewDate!), selectedDate),
    );
  }, [interviews, selectedDate]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setDrawerOpen(true);
  };

  const handleEdit = (app: ApplicationRow) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedDate(null), 250);
  };

  return (
    <div className="space-y-5">
      {/* Month nav */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm w-fit">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-300 px-2 min-w-30 text-center">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Full-width calendar */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayInterviews = interviews.filter((app) =>
              isSameDay(new Date(app.interviewDate!), day),
            );
            const isSelected =
              selectedDate && drawerOpen && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const hasInterviews = dayInterviews.length > 0;

            return (
              <div
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-22.5 p-2 border-b border-r border-zinc-100 dark:border-zinc-800/60 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/30 ${
                  !isCurrentMonth ? "bg-zinc-50/30 dark:bg-zinc-900/10" : ""
                } ${
                  isSelected
                    ? "ring-2 ring-inset ring-blue-500 bg-blue-50/40 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full transition-colors ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : isCurrentMonth
                          ? "text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {hasInterviews && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </div>

                <div className="space-y-1">
                  {dayInterviews.slice(0, 2).map((app) => (
                    <button
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(app);
                      }}
                      className="w-full text-left text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                    >
                      {app.companyName}
                    </button>
                  ))}
                  {dayInterviews.length > 2 && (
                    <p className="text-[9px] text-zinc-400 px-1">
                      +{dayInterviews.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* Right drawer */}
      <AnimatePresence>
        {drawerOpen && selectedDate && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
                  Interview Schedule
                </p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {format(selectedDate, "EEEE, MMMM do")}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {selectedInterviews.length > 0 ? (
                  <motion.div
                    key="interviews"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {selectedInterviews.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleEdit(app)}
                        className="relative pl-5 border-l-2 border-blue-500 space-y-3 cursor-pointer group/card"
                      >
                        <div className="absolute -left-1.25 top-1 w-2 h-2 rounded-full bg-blue-500 group-hover/card:scale-125 transition-transform" />

                        <div>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                            {app.position}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {app.companyName}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">
                              {app.location || "Not set"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <Briefcase className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">
                              {app.workSetup || "Not set"}
                            </span>
                          </div>
                        </div>

                        {(app.contactName || app.contactEmail) && (
                          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Recruiter Contact
                            </p>
                            {app.contactName && (
                              <div className="flex items-center gap-2 text-xs">
                                <User className="w-3 h-3 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  {app.contactName}
                                </span>
                              </div>
                            )}
                            {app.contactEmail && (
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="w-3 h-3 text-zinc-400" />
                                <span className="text-blue-600 dark:text-blue-400">
                                  {app.contactEmail}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        No interviews scheduled
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Rest up or prepare for the next one!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ApplicationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedApp(null);
        }}
        editData={selectedApp}
      />
    </div>
  );
}
