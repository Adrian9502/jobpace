"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { saveChatMessage, deleteChatHistory } from "@/lib/actions/ai";
import type { AiChatMessageRow } from "@/lib/queries/ai";
import type {
  ApplicationRow,
  PersonalNoteRow,
  ActivityLogRow,
} from "@/lib/queries";
import type { UserDocumentRow, NotificationLogRow } from "@/lib/queries/ai";

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

type ContextPayload = {
  applications: ApplicationRow[];
  notes: PersonalNoteRow[];
  activityLogs: ActivityLogRow[];
  documents: UserDocumentRow[];
  notificationLogs: NotificationLogRow[];
};

type Props = {
  initialHistory: AiChatMessageRow[];
  context: ContextPayload;
};

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const INITIAL_GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm JobPace AI. I can help you track applications, update statuses, and answer questions about your job search. What can I do for you?",
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

/**
 * Parse DB history into Message[], parsing the JSON action field.
 */
function parseHistory(rows: AiChatMessageRow[]): Message[] {
  return rows.map((row) => {
    let action: Action | null = null;
    if (row.action) {
      try {
        action = JSON.parse(row.action) as Action;
      } catch {
        // ignore malformed JSON
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
// Component
// ──────────────────────────────────────────────

export default function AiChatClient({ initialHistory, context }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialHistory.length > 0) {
      return parseHistory(initialHistory);
    }
    return [INITIAL_GREETING];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(content: string) {
    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Fire-and-forget: persist user message (no await, no UI blocking)
    saveChatMessage("user", content).catch(() => {});

    // Block before hitting the API — saves tokens entirely
    if (isUnrelated(content)) {
      const blockedReply: Message = {
        role: "assistant",
        content:
          "I'm focused on helping you with your job search. Is there anything about your applications I can help you with?",
        action: null,
      };
      setMessages([...updatedMessages, blockedReply]);
      // Persist blocked reply
      saveChatMessage("assistant", blockedReply.content).catch(() => {});
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
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

      // Fire-and-forget: persist assistant message
      saveChatMessage(
        "assistant",
        data.message,
        data.action ? JSON.stringify(data.action) : null,
      ).catch(() => {});
    } catch {
      const fallback =
        "Sorry, I couldn't connect to the server. Please check your connection and try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallback },
      ]);
      saveChatMessage("assistant", fallback).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearHistory() {
    setIsClearing(true);
    try {
      const result = await deleteChatHistory();
      if (result.success) {
        setMessages([INITIAL_GREETING]);
        toast.success("Chat history cleared");
        setShowClearConfirm(false);
      } else {
        toast.error("Failed to clear history");
        throw new Error("Failed to clear history");
      }
    } catch {
      toast.error("Failed to clear history");
      throw new Error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  }

  const hasMessages = messages.length > 1;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            JobPace AI
          </span>
        </div>
        {hasMessages && (
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={isClearing}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            Clear history
          </button>
        )}
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!hasMessages && !isLoading ? (
          // Empty state (only initial greeting shown)
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
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
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mr-1" />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"
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

      {/* Input bar pinned to bottom */}
      <ChatInput onSend={handleSend} disabled={isLoading} />

      <DeleteConfirmModal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Chat History"
        description="Are you sure you want to clear all chat history? This cannot be undone."
        onConfirm={handleClearHistory}
      />
    </div>
  );
}
