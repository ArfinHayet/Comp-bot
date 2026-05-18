import { api } from "@/lib/api";
import type { ChatSession } from "../entities/ChatSession";
import type { ChatHistoryRepository } from "./ChatHistoryRepository";

export class HttpChatHistoryRepository implements ChatHistoryRepository {
  async listSessions(): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>("/chat/history");
    return response.data;
  }
}
