import type { ChatHistoryMessage } from "./ChatHistoryMessage";

export type ChatHistoryUserStatus = "active" | "idle" | "offline";

export interface ChatHistoryUser {
  id: string;
  name: string;
  email: string;
  status: ChatHistoryUserStatus;
  lastSeen: string;
  lastMessage: string;
  messages: ChatHistoryMessage[];
}
