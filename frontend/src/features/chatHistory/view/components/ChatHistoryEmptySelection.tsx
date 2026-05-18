import { MessageSquare } from "lucide-react";

export function ChatHistoryEmptySelection() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <div>
        <MessageSquare className="mx-auto h-10 w-10 text-rm-trip-text-muted" />
        <p className="mt-3 font-semibold text-rm-trip-text">No sessions yet</p>
        <p className="mt-1 text-sm text-rm-trip-text-muted">Chat history will appear here once users start chatting.</p>
      </div>
    </div>
  );
}
