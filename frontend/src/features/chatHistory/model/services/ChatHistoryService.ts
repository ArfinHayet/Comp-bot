import type { ChatSession } from "../entities/ChatSession";
import type { ChatHistoryRepository } from "../repositories/ChatHistoryRepository";

export class ChatHistoryService {
  private readonly chatHistoryRepository: ChatHistoryRepository;

  constructor(chatHistoryRepository: ChatHistoryRepository) {
    this.chatHistoryRepository = chatHistoryRepository;
  }

  listSessions() {
    return this.chatHistoryRepository.listSessions();
  }

  filterSessions(sessions: ChatSession[], query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sessions;

    return sessions.filter(
      (session) =>
        session.sessionId.toLowerCase().includes(normalized) ||
        session.lastMessage.toLowerCase().includes(normalized),
    );
  }

  getSelectedSession(sessions: ChatSession[], filteredSessions: ChatSession[], selectedId: string) {
    return sessions.find((session) => session.sessionId === selectedId) ?? filteredSessions[0];
  }
}
