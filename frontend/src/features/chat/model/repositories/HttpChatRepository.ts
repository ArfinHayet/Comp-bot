import { sendChat } from "@/lib/api";
import type { SendChatRequestDto } from "../dto/SendChatRequestDto";
import type { SendChatResponseDto } from "../dto/SendChatResponseDto";
import type { ChatRepository } from "./ChatRepository";

export class HttpChatRepository implements ChatRepository {
  async sendMessage(request: SendChatRequestDto): Promise<SendChatResponseDto> {
    return sendChat(request.message, request.sessionId);
  }
}
