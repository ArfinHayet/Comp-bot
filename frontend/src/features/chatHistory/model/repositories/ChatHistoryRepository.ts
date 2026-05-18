import type { ChatSession } from "../entities/ChatSession";

export interface ChatHistoryRepository {
  listSessions(): Promise<ChatSession[]>;
}
