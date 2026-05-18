import { UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ChatHistoryMessage } from "../../model/entities/ChatSession";

interface ChatHistoryMessageListProps {
  messages: ChatHistoryMessage[];
}

export function ChatHistoryMessageList({ messages }: ChatHistoryMessageListProps) {
  const orderedMessages = [...messages].sort((a, b) => {
    const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    if (a.role === "user" && b.role === "assistant") return -1;
    if (a.role === "assistant" && b.role === "user") return 1;
    return 0;
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        {orderedMessages.map((message) => (
          <div key={message.id} className={cn("flex items-end gap-3", message.role === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-rm-trip-smooth border shadow-sm",
                message.role === "user"
                  ? "border-rm-trip-brand bg-rm-trip-brand text-white"
                  : "border-gray-100 bg-white",
              )}
            >
              {message.role === "user" ? (
                <UserRound className="h-4 w-4" />
              ) : (
                <img src="/favicon.svg" alt="AI" style={{ width: 16, height: 16 }} />
              )}
            </div>

            <div className={cn("flex max-w-[78%] flex-col gap-1 sm:max-w-[68%]", message.role === "user" && "items-end")}>
              <div
                className={cn(
                  "rounded-rm-trip-smooth px-4 py-3 text-sm leading-relaxed shadow-sm",
                  message.role === "user"
                    ? "bg-rm-trip-brand text-white"
                    : "border border-gray-100 bg-white text-rm-trip-text",
                )}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-rm-trip-brand">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="px-1 text-[11px] font-medium text-rm-trip-text-muted">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
