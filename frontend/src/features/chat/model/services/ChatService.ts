import type { ChatRepository } from "../repositories/ChatRepository";

export class ChatService {
  private readonly chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  sendMessage(message: string, sessionId: string) {
    return this.chatRepository.sendMessage({ message, sessionId });
  }
}
