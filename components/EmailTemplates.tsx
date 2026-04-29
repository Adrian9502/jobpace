"use client";

import { useState } from "react";
import { Mail, Copy, Check, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATES = [
  {
    id: "follow-up-1",
    title: "Follow-up (1 Week)",
    category: "Follow-up",
    subject: "Following up on my application - [Position] at [Company]",
    body: `Dear [Recruiter Name/Hiring Manager],

I hope you're having a great week!

I'm writing to follow up on my application for the [Position] role at [Company]. I'm still very interested in the opportunity and wanted to see if there are any updates regarding the next steps.

Please let me know if there's any additional information I can provide.

Best regards,
[Your Name]`,
  },
  {
    id: "thank-you-interview",
    title: "Thank You (Post-Interview)",
    category: "Interview",
    subject: "Thank you - [Position] Interview",
    body: `Dear [Interviewer Name],

Thank you for the opportunity to interview for the [Position] role today. It was great learning more about the team and the exciting projects at [Company].

I'm particularly interested in [something specific discussed], and I'm confident my skills in [your key skill] would be a great fit for the team.

Looking forward to hearing from you.

Best regards,
[Your Name]`,
  },
  {
    id: "accept-offer",
    title: "Accepting an Offer",
    category: "Offer",
    subject: "Job Offer Acceptance - [Position] - [Your Name]",
    body: `Dear [Hiring Manager Name],

I am thrilled to formally accept the offer for the [Position] role at [Company]. 

Thank you for this opportunity. I am excited to join the team and contribute to [Company]'s success. As discussed, my start date will be [Start Date].

I look forward to the onboarding process.

Best regards,
[Your Name]`,
  },
  {
    id: "decline-offer",
    title: "Declining an Offer",
    category: "Offer",
    subject: "Update regarding job offer - [Your Name]",
    body: `Dear [Hiring Manager Name],

Thank you very much for offering me the [Position] role at [Company]. 

After careful consideration, I have decided to accept another offer that aligns more closely with my current career goals. This was a difficult decision as I was very impressed with your team and company.

Thank you again for your time and for the opportunity. I wish [Company] all the best.

Sincerely,
[Your Name]`,
  },
];

export default function EmailTemplates() {
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
  const [search, setSearch] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedId)!;

  const filteredTemplates = TEMPLATES.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
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
          Professional templates to help you communicate effectively with recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
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
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between group transition-all ${
                  selectedId === t.id
                    ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">{t.category}</p>
                  <p className="text-sm font-semibold">{t.title}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedId === t.id ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Subject Line</label>
                    <button
                      onClick={() => copyToClipboard(selectedTemplate.subject, "Subject")}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      {copiedField === "Subject" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedField === "Subject" ? "COPIED" : "COPY"}
                    </button>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">Email Body</label>
                    <button
                      onClick={() => copyToClipboard(selectedTemplate.body, "Email Body")}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      {copiedField === "Email Body" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedField === "Email Body" ? "COPIED" : "COPY"}
                    </button>
                  </div>
                  <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-serif leading-relaxed">
                    {selectedTemplate.body}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">!</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Don't forget to replace the placeholders in <span className="font-bold">[brackets]</span> with your actual details before sending!
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
