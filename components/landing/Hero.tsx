"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

interface HeroProps {
  onLogin: () => void;
}

export default function Hero({ onLogin }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col gap-6 mb-10">
              <Image
                src="/jobpace-logo-blue.png"
                alt="JobPace Logo"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-2xl shadow-blue-500/20"
                priority
              />

              <Image
                src="/jobpace-title-horizontal2.png"
                alt="JobPace - Your job search, at your pace."
                width={500}
                height={150}
                className="w-full max-w-[450px] h-auto dark:brightness-200 dark:contrast-125 transition-all"
                priority
              />
            </div>

            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl leading-relaxed font-medium">
              Track applications, manage interviews, and land your dream job with our intuitive Kanban board and AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xl transition-all shadow-xl shadow-blue-500/30 group active:scale-[0.98]"
              >
                Get Started Free
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
              </button>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 px-10 py-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-2xl font-extrabold text-xl transition-all active:scale-[0.98]"
              >
                See Features
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-[100px] rounded-full opacity-50 dark:opacity-30"></div>
            <div className="relative rounded-[2.5rem] p-3 bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 shadow-2xl">
              <div className="rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner">
                <Image
                  src="/hero.png"
                  alt="JobPace Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto hover:scale-[1.02] transition-transform duration-700"
                  priority
                  loading="eager"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
