"use client";

import { useState } from "react";
import { Copy, Check, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";

const CATEGORY_ORDER = [
  "Follow-up",
  "Interview",
  "Offer - Accept",
  "Offer - Decline",
];
const ALL_CATEGORY = "All";

export default function EmailTemplates() {
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATES[0]?.id ?? "");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [search, setSearch] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const categories = [
    ALL_CATEGORY,
    ...CATEGORY_ORDER,
    ...Array.from(new Set(EMAIL_TEMPLATES.map((t) => t.category))).filter(
      (category) => !CATEGORY_ORDER.includes(category),
    ),
  ];

  const filteredTemplates = EMAIL_TEMPLATES.filter((t) => {
    const matchesCategory =
      activeCategory === ALL_CATEGORY || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const effectiveSelectedId = filteredTemplates.some(
    (template) => template.id === selectedId,
  )
    ? selectedId
    : (filteredTemplates[0]?.id ?? "");

  const selectedTemplate = filteredTemplates.find(
    (t) => t.id === effectiveSelectedId,
  );

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Email Templates
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Professional templates to help you communicate effectively with
          recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  activeCategory === category
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                    : "bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900 shadow-sm">
            {filteredTemplates.length === 0 ? (
              <div className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400 text-center">
                No templates match your filters.
              </div>
            ) : (
              filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between group transition-all ${
                    effectiveSelectedId === t.id
                      ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">
                      {t.category}
                    </p>
                    <p className="text-sm font-semibold">{t.title}</p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${effectiveSelectedId === t.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`}
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8 self-start">
          <AnimatePresence mode="wait">
            {selectedTemplate ? (
              <motion.div
                key={effectiveSelectedId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                        Subject Line
                      </label>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedTemplate.subject, "Subject")
                        }
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                      >
                        {copiedField === "Subject" ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedField === "Subject" ? "COPIED" : "COPY"}
                      </button>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {selectedTemplate.subject}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                        Email Body
                      </label>
                      <button
                        onClick={() =>
                          copyToClipboard(selectedTemplate.body, "Email Body")
                        }
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                      >
                        {copiedField === "Email Body" ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedField === "Email Body" ? "COPIED" : "COPY"}
                      </button>
                    </div>
                    <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {selectedTemplate.body}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        !
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Do not forget to replace the placeholders in{" "}
                      <span className="font-bold">[brackets]</span> with your
                      actual details before sending!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No templates match your filters.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
