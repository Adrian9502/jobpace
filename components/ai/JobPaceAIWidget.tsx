"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ExternalLink, Send, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { saveChatMessage } from "@/lib/actions/ai";
import type { AiChatMessageRow } from "@/lib/queries/ai";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type Action = {
  tool: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  success: boolean;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  action?: Action | null;
};

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const INITIAL_GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm JobPace AI. Ask me anything about your applications, notes, or documents.",
};

const UNRELATED_PATTERNS = [
  /what (would|will) you (ask|do|say)/i,
  /\d+\s*[+\-*/]\s*\d+/,
  /what is \d+/i,
  /who (is|was|are)/i,
  /what (is|are|was|were) (the|a|an)(?! (status|stage|count|total|number|needed|required|info|information|details|company|position|salary))/i,
  /tell me (a joke|about yourself|something)/i,
  /how are you/i,
  /what do you think about/i,
  /if you (could|were|had)/i,
  /imagine/i,
  /recommend (a movie|a book|music|food|restaurant)/i,
];

function isUnrelated(message: string): boolean {
  return UNRELATED_PATTERNS.some((pattern) => pattern.test(message));
}

function parseHistory(rows: AiChatMessageRow[]): Message[] {
  return rows.map((row) => {
    let action: Action | null = null;
    if (row.action) {
      try {
        action = JSON.parse(row.action) as Action;
      } catch {
        // ignore
      }
    }
    return {
      role: row.role as "user" | "assistant",
      content: row.content,
      action,
    };
  });
}

// ──────────────────────────────────────────────
// Widget
// ──────────────────────────────────────────────

export default function JobPaceAIWidget() {
  const pathname = usePathname();

  // Hide on the full AI page
  if (pathname === "/dashboard/ai") return null;

  return <WidgetInner />;
}

function WidgetInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch history on first open
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/ai/history");
      if (!res.ok) return;
      const data = await res.json();
      const rows = data.messages as AiChatMessageRow[];
      if (rows && rows.length > 0) {
        setMessages(parseHistory(rows));
      }
    } catch {
      // silently fail — keep greeting
    } finally {
      setHistoryLoaded(true);
    }
  }, [historyLoaded]);

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadHistory();
    }
  }, [isOpen, historyLoaded, loadHistory]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInputValue("");

    // Fire-and-forget save
    saveChatMessage("user", trimmed).catch(() => {});

    // Block unrelated
    if (isUnrelated(trimmed)) {
      const blockedReply: Message = {
        role: "assistant",
        content:
          "I'm focused on helping you with your job search. Is there anything about your applications I can help you with?",
        action: null,
      };
      setMessages([...updated, blockedReply]);
      saveChatMessage("assistant", blockedReply.content).catch(() => {});
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage =
          errorData?.error || "Something went wrong. Please try again.";
        const errorReply: Message = {
          role: "assistant",
          content: errorMessage,
        };
        setMessages((prev) => [...prev, errorReply]);
        saveChatMessage("assistant", errorMessage).catch(() => {});
        return;
      }

      const data = await res.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.message,
        action: data.action || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
      saveChatMessage(
        "assistant",
        data.message,
        data.action ? JSON.stringify(data.action) : null,
      ).catch(() => {});
    } catch {
      const fallback = "Connection error. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallback },
      ]);
      saveChatMessage("assistant", fallback).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const hasMessages = messages.length > 1;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-20 right-5 w-80 h-[460px] max-sm:inset-4 max-sm:w-auto max-sm:h-auto max-sm:bottom-4 max-sm:right-4 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-blue-600 dark:bg-blue-700">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-zinc-100">
                  JobPace AI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="/dashboard/ai"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-100 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-200 transition-colors"
                  title="Open full chat"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-100 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {!hasMessages && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-3">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                    Ask me anything about your applications
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <ChatMessage
                      key={i}
                      role={msg.role}
                      content={msg.content}
                      action={msg.action}
                    />
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl rounded-bl-sm px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Bot className="h-3 w-3 text-zinc-400 dark:text-zinc-500 mr-0.5" />
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your apps..."
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
