"use client";

import ActionCard from "./ActionCard";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  action?: {
    tool: string;
    args: Record<string, unknown>;
    result: Record<string, unknown>;
    success: boolean;
  } | null;
};

export default function ChatMessage({ role, content, action }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] sm:max-w-[75%]`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-xl rounded-br-sm"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl rounded-bl-sm"
          }`}
        >
          {content}
        </div>
        {!isUser && action && <ActionCard action={action} />}
      </div>
    </div>
  );
}
