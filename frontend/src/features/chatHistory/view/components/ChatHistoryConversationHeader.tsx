import { Clock, MessageSquare } from "lucide-react";
import type { ChatSession } from "../../model/entities/ChatSession";
import { formatRelativeTime, shortSessionId } from "../../model/services/chatHistoryFormatters";

interface ChatHistoryConversationHeaderProps {
  session: ChatSession;
}

export function ChatHistoryConversationHeader({ session }: ChatHistoryConversationHeaderProps) {
  return (
    <div className="border-b border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-rm-trip-smooth bg-rm-trip-brand text-sm font-bold text-white shadow-rm-trip-glow">
            #
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-rm-trip-heading text-lg font-bold text-rm-trip-text">
              Session {shortSessionId(session.sessionId)}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-rm-trip-text-muted">
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {session.messageCount} messages
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(session.lastMessageAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden rounded-rm-trip-pill border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-bold text-rm-trip-text-muted sm:block">
          Read only
        </div>
      </div>
    </div>
  );
}
