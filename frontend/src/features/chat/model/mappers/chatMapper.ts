import type { ChatMessage } from "../entities/ChatMessage";
import type { SendChatResponseDto } from "../dto/SendChatResponseDto";

export function createUserMessage(content: string): ChatMessage {
  return {
    role: "user",
    content,
  };
}

export function mapChatResponseToAssistantMessage(response: SendChatResponseDto): ChatMessage {
  return {
    role: "assistant",
    content: response.answer,
    cached: response.cached,
  };
}

export function createChatErrorMessage(): ChatMessage {
  return {
    role: "assistant",
    content: "Something went wrong. Please try again.",
  };
}
