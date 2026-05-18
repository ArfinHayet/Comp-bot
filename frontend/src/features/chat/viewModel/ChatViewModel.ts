import type { ChangeEvent, KeyboardEvent, RefObject } from "react";
import type { ChatMessage } from "../model/entities/ChatMessage";

export interface ChatViewModel {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  canSend: boolean;
  setSuggestedQuestion(question: string): void;
  handleInputChange(event: ChangeEvent<HTMLTextAreaElement>): void;
  handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void;
  send(): Promise<void>;
  clearChat(): void;
}
