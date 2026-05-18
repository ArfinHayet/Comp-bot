import { getChatHistory } from "@/lib/api";
import type { ChatSession } from "../entities/ChatSession";
import type { ChatHistoryRepository } from "./ChatHistoryRepository";

export class HttpChatHistoryRepository implements ChatHistoryRepository {
  listSessions(): Promise<ChatSession[]> {
    return getChatHistory();
  }
}
