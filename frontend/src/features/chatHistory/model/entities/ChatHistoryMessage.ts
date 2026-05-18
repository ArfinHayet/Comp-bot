export type ChatHistoryMessageRole = "user" | "assistant";

export interface ChatHistoryMessage {
  id: string;
  role: ChatHistoryMessageRole;
  content: string;
  time: string;
}
