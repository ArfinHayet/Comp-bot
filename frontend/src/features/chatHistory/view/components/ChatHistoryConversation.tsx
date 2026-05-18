import type { ChatSession } from "../../model/entities/ChatSession";
import { ChatHistoryConversationHeader } from "./ChatHistoryConversationHeader";
import { ChatHistoryEmptySelection } from "./ChatHistoryEmptySelection";
import { ChatHistoryMessageList } from "./ChatHistoryMessageList";

interface ChatHistoryConversationProps {
  selectedSession: ChatSession | undefined;
}

export function ChatHistoryConversation({ selectedSession }: ChatHistoryConversationProps) {
  return (
    <section className="flex min-h-0 flex-col bg-rm-trip-surface">
      {selectedSession ? (
        <>
          <ChatHistoryConversationHeader session={selectedSession} />
          <ChatHistoryMessageList messages={selectedSession.messages} />
        </>
      ) : (
        <ChatHistoryEmptySelection />
      )}
    </section>
  );
}
