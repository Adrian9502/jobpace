"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 tracking-tighter leading-tight">
            Started from a simple frustration — <span className="text-blue-600">job hunting is messy.</span>
          </h2>
          <div className="space-y-6 text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            <p>
              Applications get lost, follow-ups are forgotten, and the whole
              process starts to feel like shouting into the void.
            </p>
            <p>
              Job Pace gives you one place to track everything, so instead of
              managing chaos, you're just moving forward.
            </p>
            <p>
              It's straightforward by design — because your job search is
              already complicated enough.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}