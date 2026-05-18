export interface ChatHistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  messageCount: number;
  lastMessage: string;
  lastRole: "user" | "assistant";
  firstMessageAt: string;
  lastMessageAt: string;
  messages: ChatHistoryMessage[];
}
