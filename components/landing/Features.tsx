"use client";

import { motion } from "framer-motion";
import { 
  FiBarChart2, 
  FiGrid,
  FiList,
  FiColumns,
  FiArchive,
  FiClock,
  FiActivity
} from "react-icons/fi";

const FEATURES_DATA = [
  {
    title: "Smart Dashboard",
    description: "Get a high-level overview of your job search progress at a single glance.",
    icon: <FiGrid className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Application Manager",
    description: "View and manage all your job applications in a clean, searchable list.",
    icon: <FiList className="w-6 h-6 text-indigo-500" />,
  },
  {
    title: "Kanban Board",
    description: "Organize your journey with an intuitive drag-and-drop board designed for speed.",
    icon: <FiColumns className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Job Archive",
    description: "Keep your workspace clean by archiving past applications for future reference.",
    icon: <FiArchive className="w-6 h-6 text-pink-500" />,
  },
  {
    title: "Visual Timeline",
    description: "Track your progress over time and never miss an important milestone.",
    icon: <FiClock className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Activity Logs",
    description: "Keep a detailed history of every change and update made to your applications.",
    icon: <FiActivity className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Advanced Analytics",
    description: "Understand your success rates with beautiful charts and data-driven insights.",
    icon: <FiBarChart2 className="w-6 h-6 text-cyan-500" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">Everything you need to stay ahead</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium">Stop using messy spreadsheets. JobPace is designed to keep your job search organized and efficient.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {FEATURES_DATA.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-10 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3 shadow-sm shadow-blue-500/10">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
