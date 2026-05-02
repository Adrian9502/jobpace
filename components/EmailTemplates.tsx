"use client";

import { useState } from "react";
import { Copy, Check, Search, X, Mail } from "lucide-react";
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

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  "Follow-up": {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-400",
  },
  Interview: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-400",
  },
  "Offer - Accept": {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
  "Offer - Decline": {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-400",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-zinc-100 dark:bg-zinc-800",
  text: "text-zinc-600 dark:text-zinc-300",
  dot: "bg-zinc-400",
};

export default function EmailTemplates() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [search, setSearch] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const categories = [
    ALL_CATEGORY,
    ...CATEGORY_ORDER,
    ...Array.from(new Set(EMAIL_TEMPLATES.map((t) => t.category))).filter(
      (c) => !CATEGORY_ORDER.includes(c),
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

  const selectedTemplate =
    filteredTemplates.find((t) => t.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setCopiedField(null);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 text-zinc-700 dark:text-zinc-300 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat] ?? DEFAULT_COLOR;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm"
                    : "bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400">
          No templates match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredTemplates.map((t) => {
            const color = CATEGORY_COLORS[t.category] ?? DEFAULT_COLOR;
            const isSelected = selectedId === t.id;

            return (
              <motion.button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                layout
                className={`text-left p-4 rounded-xl border transition-all group relative ${
                  isSelected
                    ? "border-blue-400 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/10 shadow-sm ring-1 ring-blue-400/30 dark:ring-blue-500/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                }`}
              >
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${color.bg} ${color.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                    {t.category}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>

                {/* Title */}
                <p
                  className={`text-sm font-semibold mb-2 leading-snug transition-colors ${
                    isSelected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {t.title}
                </p>

                {/* Subject preview */}
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  {t.subject}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedId(null)}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* Right Drawer */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            key={selectedTemplate.id}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                {(() => {
                  const color =
                    CATEGORY_COLORS[selectedTemplate.category] ?? DEFAULT_COLOR;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold mb-2 ${color.bg} ${color.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${color.dot}`}
                      />
                      {selectedTemplate.category}
                    </span>
                  );
                })()}
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {selectedTemplate.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="mt-1 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer content — scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Subject */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Subject line
                  </label>
                  <CopyButton
                    field="Subject"
                    copiedField={copiedField}
                    onClick={() =>
                      copyToClipboard(selectedTemplate.subject, "Subject")
                    }
                  />
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {selectedTemplate.subject}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Email body
                  </label>
                  <CopyButton
                    field="Email Body"
                    copiedField={copiedField}
                    onClick={() =>
                      copyToClipboard(selectedTemplate.body, "Email Body")
                    }
                  />
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedTemplate.body}
                </div>
              </div>

              {/* Reminder */}
              <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex items-start gap-2.5">
                <span className="text-amber-500 text-xs font-bold mt-0.5">
                  !
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Replace all <span className="font-bold">[brackets]</span> with
                  your actual details before sending.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyButton({
  field,
  copiedField,
  onClick,
}: {
  field: string;
  copiedField: string | null;
  onClick: () => void;
}) {
  const copied = copiedField === field;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
        copied
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-blue-600 dark:text-blue-400 hover:underline"
      }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}
