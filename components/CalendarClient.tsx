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
  addDays, 
  eachDayOfInterval 
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Briefcase, User, Mail } from "lucide-react";
import type { ApplicationRow } from "@/lib/queries";

import { motion, AnimatePresence } from "framer-motion";
import ApplicationModal from "./ApplicationModal";

interface Props {
  applications: ApplicationRow[];
}

export default function CalendarClient({ applications }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);

  // Filter applications that have an interview date
  const interviews = useMemo(() => {
    return applications.filter(app => app.interviewDate !== null);
  }, [applications]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const selectedInterviews = useMemo(() => {
    if (!selectedDate) return [];
    return interviews.filter(app => isSameDay(new Date(app.interviewDate!), selectedDate));
  }, [interviews, selectedDate]);

  const handleEdit = (app: ApplicationRow) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Interview Calendar
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Keep track of your scheduled interviews and assessments.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold px-2 min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayInterviews = interviews.filter(app => isSameDay(new Date(app.interviewDate!), day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] p-2 border-b border-r border-zinc-200 dark:border-zinc-800 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/30 group ${
                    !isCurrentMonth ? "bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-100"
                  } ${isSelected ? "ring-2 ring-inset ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                      isToday ? "bg-blue-600 text-white" : ""
                    }`}>
                      {format(day, "d")}
                    </span>
                    {dayInterviews.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {dayInterviews.slice(0, 2).map((app) => (
                      <button 
                        key={app.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(app);
                        }}
                        className="w-full text-left text-[10px] truncate px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                      >
                        {app.companyName}
                      </button>
                    ))}
                    {dayInterviews.length > 2 && (
                      <div className="text-[9px] text-zinc-500 px-1">
                        +{dayInterviews.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a date"}
              </h3>
            </div>
            
            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                {selectedInterviews.length > 0 ? (
                  <motion.div
                    key="interviews"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    {selectedInterviews.map((app) => (
                      <div 
                        key={app.id} 
                        onClick={() => handleEdit(app)}
                        className="relative pl-6 border-l-2 border-blue-500 space-y-3 cursor-pointer group/card"
                      >
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500 group-hover/card:scale-125 transition-transform" />
                        
                        <div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">{app.position}</h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{app.companyName}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {app.location || "Location not set"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                            {app.workSetup || "Setup not set"}
                          </div>
                        </div>

                        {(app.contactName || app.contactEmail) && (
                          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Recruiter Contact</p>
                            {app.contactName && (
                              <div className="flex items-center gap-2 text-xs">
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">{app.contactName}</span>
                              </div>
                            )}
                            {app.contactEmail && (
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-blue-600 dark:text-blue-400 hover:underline">{app.contactEmail}</span>
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
                    className="h-full flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No interviews scheduled</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Rest up or prepare for the next one!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

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
